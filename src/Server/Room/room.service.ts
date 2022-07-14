import {Injectable, NotFoundException, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

import { Room, RoomDocument } from '../../Schemas/room.schema';
import { Message, MessageDocument } from '../../Schemas/message.schema';
import { UserService } from '../User/user.service';
import { CreateRoomDto, UpdateRoomDto } from './Validation';
import { IRoom } from './Types/room';
import { AddMessageDto } from '../Chat/Validation/add-message.dto';
import { IMessage } from './Types/message';

import {
  BlockedUserException,
  InternalServerException,
  RoomNotFoundException,
} from '../../Common/Errors';
import { ChatGateway } from "../Chat/chat.gateway";

@Injectable()
export class RoomService implements OnModuleInit, OnModuleDestroy {
  public redisClient: Redis;
  public publisherClient: Redis;
  private subscriberClient: Redis;
  private discoveryInterval;
  private readonly serviceId: string;

  constructor(
    private readonly chatGateway: ChatGateway,

    @InjectModel(Room.name) private roomRepository: Model<RoomDocument>,

    @InjectModel(Message.name)
    private messageRepository: Model<MessageDocument>,

    private readonly userService: UserService,
  ) {
    this.serviceId = 'SOCKET_CHANNEL_' + Math.random()
        .toString(26)
        .slice(2);
  }

  async onModuleInit() {

    this.redisClient = await this.newRedisClient();
    this.subscriberClient = await this.newRedisClient();
    this.publisherClient = await this.newRedisClient();

    this.subscriberClient.subscribe(this.serviceId);

    this.subscriberClient.on('message', (channel, message) => {
      const { userId, payload } = JSON.parse(message);
      this.addMessage(userId, payload, true);
    });

    await this.channelDiscovery();
  }

  private async newRedisClient() {
    return new Redis({
      host: 'localhost',
      port: 6379,
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

  async findAll(): Promise<IRoom[]> {
    const rooms = await this.roomRepository.find().populate('messages');
    return rooms;
  }

  async getRoomById(id: string): Promise<IRoom> {
    const room = await this.roomRepository.findById(id).lean();

    if (!room) {
      throw new RoomNotFoundException();
    }

    return room;
  }

  async findOneAndPopulate(id: string): Promise<IRoom> {
    const room = await this.roomRepository
      .findById(id)
      .populate('messages users bannedUsers')
      .lean();

    if (!room) {
      throw new NotFoundException(`There is no room under id ${id}`);
    }

    return room;
  }

  async create(createRoomDto: CreateRoomDto): Promise<IRoom> {
    const room = await this.roomRepository.create({
      _id: uuidv4(),
      ...createRoomDto,
      users: [createRoomDto.createdBy],
    });
    await this.userService.updateUserRoom(room.createdBy, room._id);
    return room;
  }

  async addMessage(addMessageDto: AddMessageDto): Promise<IMessage> {
    const {
      sender,
      recipient: recipientUserName,
      text,
      roomId,
    } = addMessageDto;

    const { _id: senderId, room: senderRoomId } =
      await this.userService.getUser(sender);

    // todo: this service should utilize DB transactions to ensure atomicity of DB across multiple DB operations.

    if (!senderRoomId || roomId !== senderRoomId.toString()) {
      await this.userService.updateUserRoom(sender, roomId);
      await this.updateRoomWithUser({ roomId, user: sender });
    }

    const room = await this.getRoomById(roomId);

    const {
      _id: recipientId,
      blockedUsers,
      room: recipientChatRoomId,
    } = await this.userService.getUserByUsername(recipientUserName);

    if (blockedUsers.includes(senderId)) throw new BlockedUserException();

    try {
      if (recipientChatRoomId !== roomId) {
        await this.userService.updateUserRoom(recipientId, roomId);
        await this.updateRoomWithUser({ roomId, user: recipientId });
      }

      const message: IMessage = await this.messageRepository.create({
        _id: uuidv4(),
        text,
        room,
        sender: senderId,
        recipient: recipientId,
      });
      await this.roomRepository.updateOne(
        { _id: roomId },
        { $push: { messages: message._id } },
      );
      return message;
    } catch (e) {
      throw new InternalServerException();
    }
  }

  async updateRoomWithUser({ roomId, user }: UpdateRoomDto): Promise<void> {
    try {
      await this.roomRepository.updateOne(
        { _id: roomId },
        { $addToSet: { users: user } },
      );
    } catch (e) {
      throw new RoomNotFoundException();
    }
  }

  async remove(id: string) {
    const room = await this.getRoomById(id);
    return this.roomRepository.remove(room);
  }
}
