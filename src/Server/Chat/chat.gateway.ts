import { ForbiddenException, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

import { AddMessageDto } from './Validation/add-message.dto';
import { JoinRoomDto } from './Validation/join-room.dto';
import { LeaveRoomDto } from './Validation/leave-room.dto';
// import { KickUserDto } from './Validation/kick-user.dto';
import { BanUserDto } from './Validation/ban-user.dto';
import { UserService } from '../User/user.service';
import { AuthService } from '../Auth/auth.service';
import { RoomService } from '../Room/room.service';

import Constants from '../../Common/constants';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly roomService: RoomService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.query.token.toString();
    const room = client.handshake.query.room.toString();
    const payload = this.authService.verifyAccessToken(token);
    const user = payload && (await this.userService.getUser(payload.sub));

    if (!user) {
      client.disconnect(true);

      return;
    }

    this.connectedUsers.set(client.id, user._id);

    if (room || user.room) {
      return this.onRoomJoin(client, { roomId: room });
    }
  }

  async handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, addMessageDto: AddMessageDto) {
    const userId = this.connectedUsers.get(client.id);
    const user = await this.userService.getUser(userId);

    if (!user.room) {
      return;
    }

    addMessageDto.sender = userId;
    addMessageDto.roomId = user.room;

    await this.roomService.addMessage(addMessageDto);

    client.to(user.room).emit('message', [addMessageDto.text]);
  }

  @SubscribeMessage('join')
  async onRoomJoin(client: Socket, joinRoomDto: JoinRoomDto) {
    const { roomId } = joinRoomDto;
    const limit = Constants.ROOM_MESSAGES_LIMIT;

    const room = await this.roomService.findOneAndPopulate(roomId);

    if (!room) return;

    const userId = this.connectedUsers.get(client.id);
    const messages = room.messages
      .slice(limit * -1)
      .map((message) => message.text);

    await this.roomService.updateRoomWithUser({ roomId, user: userId });
    await this.userService.updateUserRoom(userId, room._id);

    client.join(roomId);

    client.emit('message', messages);
  }

  @SubscribeMessage('leave')
  async onRoomLeave(client: Socket, leaveRoomDto: LeaveRoomDto) {
    const { roomId } = leaveRoomDto;
    const userId = this.connectedUsers.get(client.id);

    await this.userService.updateUserRoom(userId, null);

    client.leave(roomId);
  }
}
