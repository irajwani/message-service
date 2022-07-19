import {
  ForbiddenException,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AddMessageDto } from './Validation/add-message.dto';

import { UserService } from '../User/user.service';
import { AuthService } from '../Auth/auth.service';

import Constants from '../../Common/constants';
import { ChatService } from './chat.service';
import { Message, MessageDocument } from '../../Schemas/message.schema';
import { ConfigService } from '@nestjs/config';

@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  public redisClient: Redis;
  public publisherClient: Redis;
  private subscriberClient: Redis;
  private discoveryInterval;
  private readonly serviceId: string;

  public connectedSockets: Map<string, Socket[]> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Message.name)
    private messageRepository: Model<MessageDocument>,
    private chatService: ChatService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    this.serviceId = 'SOCKET_CHANNEL_' + Math.random().toString(26).slice(2);
  }

  async onModuleInit() {
    this.redisClient = await this.newRedisClient();
    this.subscriberClient = await this.newRedisClient();
    this.publisherClient = await this.newRedisClient();

    this.subscriberClient.subscribe(this.serviceId);

    this.subscriberClient.on('message', (channel, payload) => {
      console.log('received a message');
      const data: AddMessageDto = JSON.parse(payload);
      this.broadcastMessage(data, true);
      this.chatService.addMessage(data);
    });

    await this.channelDiscovery();
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      // todo: retrieve token from headers
      const token = client.handshake.query.token.toString();
      const payload = this.authService.verifyAccessToken(token);
      const user = payload && (await this.userService.getUser(payload.sub));

      if (!user) {
        client.disconnect(true);
        return;
      }

      const messages = await this.userService.getUserMessages(user._id);

      if (!this.connectedSockets.has(user._id)) {
        this.connectedSockets.set(user._id, []);
      }
      const existingClients: Socket[] | [] = this.connectedSockets.get(
        user._id,
      );
      this.connectedSockets.set(user._id, [...existingClients, client]);
      client.emit(
        'message',
        messages.map((m) => m.text),
      );
      console.log(this.connectedSockets);
    } catch (e) {
      throw new ForbiddenException();
    }
  }

  async handleDisconnect(client: Socket) {
    for (const [userId, sockets] of this.connectedSockets.entries()) {
      this.connectedSockets.set(
        userId,
        sockets.filter((socket) => socket.id !== client.id),
      );
    }
  }

  private async newRedisClient() {
    return new Redis({
      host: this.configService.get<string>('app.redisHost'),
      port: this.configService.get<number>('app.redisPort'),
    });
  }

  async onModuleDestroy() {
    this.discoveryInterval && clearTimeout(this.discoveryInterval);
  }

  private async channelDiscovery() {
    this.redisClient.setex(this.serviceId, 3, Date.now().toString());
    this.discoveryInterval = setTimeout(() => {
      this.channelDiscovery();
    }, 2000);
  }

  async broadcastMessage(
    addMessageDto: AddMessageDto,
    fromRedisChannel: boolean,
  ): Promise<void> {
    const { sender, text } = addMessageDto;
    this.connectedSockets
      .get(sender)
      ?.forEach((socket) => socket.emit('message', [text]));
    if (!fromRedisChannel) {
      this.redisClient.keys('SOCKET_CHANNEL_*', (err, ids) => {
        ids
          .filter((p) => p !== this.serviceId)
          .forEach((id) => {
            this.publisherClient.publish(id, JSON.stringify(addMessageDto));
          });
      });
    }
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, addMessageDto: AddMessageDto): Promise<void> {
    console.log('message received', addMessageDto);
    await this.broadcastMessage(addMessageDto, false);
    await this.chatService.addMessage(addMessageDto);
  }

  // const { userId } = this.connectedSockets.get(client.id);
  // const user = await this.userService.getUser(userId);
  //
  // addMessageDto.sender = userId;

  // const message = await this.chatService.addMessage(addMessageDto);
  // client.emit('message', [message.text]);

  // @SubscribeMessage('join')
  // async onRoomJoin(client: Socket, joinRoomDto: JoinRoomDto) {
  //   const { roomId } = joinRoomDto;
  //   const limit = Constants.ROOM_MESSAGES_LIMIT;
  //
  //   const room = await this.roomService.findOneAndPopulate(roomId);
  //
  //   if (!room) return;
  //
  //   const userId = this.connectedSockets.get(client.id);
  //   const messages = room.messages
  //     .slice(limit * -1)
  //     .map((message) => message.text);
  //
  //   await this.roomService.updateRoomWithUser({ roomId, user: userId });
  //   await this.userService.updateUserRoom(userId, room._id);
  //
  //   client.join(roomId);
  //   client.emit('message', messages);
  // }
  //
  // @SubscribeMessage('leave')
  // async onRoomLeave(client: Socket, leaveRoomDto: LeaveRoomDto) {
  //   const { roomId } = leaveRoomDto;
  //   const userId = this.connectedSockets.get(client.id);
  //
  //   await this.userService.updateUserRoom(userId, null);
  //
  //   client.leave(roomId);
  // }
}
