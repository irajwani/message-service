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
  public connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly configService: ConfigService,
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
      console.log('TANAKA', channel);
      const data: AddMessageDto = JSON.parse(payload);
      this.broadcastMessage(data, true);
      this.chatService.addMessage(data);
    });

    await this.channelDiscovery();
  }

  async onModuleDestroy() {
    this.discoveryInterval && clearTimeout(this.discoveryInterval);
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      // TODO: retrieve token from headers
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
      this.connectedUsers.set(client.id, user._id);
      client.emit(
        'message',
        messages.map((m) => m.text),
      );
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
    // emit message to all of sender's open devices/clients
    this.connectedSockets
      .get(sender)
      ?.forEach((socket) => socket.emit('message', [text]));

    //TODO: enhance client system so above process is posssible for recipientId
    this.connectedSockets
      .get('2f60823c-4d4c-41ed-8746-035b1c9ed72d')
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
    const userId = this.connectedUsers.get(client.id);
    addMessageDto.sender = userId;
    await this.broadcastMessage(addMessageDto, false);
  }
}
