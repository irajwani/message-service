import {
  ForbiddenException,
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

import { AddMessageDto } from './Validation/add-message.dto';

import { UserService } from '../User/user.service';
import { AuthService } from '../Auth/auth.service';

import { ChatService } from './chat.service';
import { ConfigService } from '@nestjs/config';
import { IMessage } from './Types/message';

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
      const data: IMessage = JSON.parse(payload);
      this.broadcastMessage(data, true);
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
      console.log(e);
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
    message: IMessage,
    fromRedisChannel: boolean,
  ): Promise<void> {
    const { sender, recipient, text } = message;
    // emit message to all of sender's open devices/clients
    this.connectedSockets
      .get(sender)
      ?.forEach((socket) => socket.emit('message', [text]));

    //TODO: enhance client system so above process is posssible for recipientId
    this.connectedSockets
      .get(recipient)
      ?.forEach((socket) => socket.emit('message', [text]));

    if (!fromRedisChannel) {
      // Publish to all channels that are not the current server's channel
      this.redisClient.keys('SOCKET_CHANNEL_*', (err, ids) => {
        ids
          .filter((p) => p !== this.serviceId)
          .forEach((id) => {
            this.publisherClient.publish(id, JSON.stringify(message));
          });
      });
    }
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, addMessageDto: AddMessageDto): Promise<void> {
    const userId = this.connectedUsers.get(client.id);
    addMessageDto.sender = userId;
    const message: IMessage = await this.chatService.addMessage(addMessageDto);
    await this.broadcastMessage(message, false);
  }
}
