import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Room, RoomDocument } from '../../Schemas/room.schema';
import { Message, MessageDocument } from '../../Schemas/message.schema';
import { UserService } from '../User/user.service';
import { CreateRoomDto, UpdateRoomDto } from './Validation';
import { IRoom } from './Types/room';
import { AddMessageDto } from '../Chat/Validation/add-message.dto';
import { IMessage } from './Types/message';
import { BanUserDto } from '../Chat/Validation/ban-user.dto';
import {
  BlockedUserException,
  InternalServerException,
  RoomNotFoundException,
} from '../../Common/Errors';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomRepository: Model<RoomDocument>,

    @InjectModel(Message.name)
    private messageRepository: Model<MessageDocument>,

    private readonly userService: UserService,
  ) {}

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

      const message = await this.messageRepository.create({
        text,
        room,
        user: senderId,
      });
      await this.roomRepository.updateOne(
        { _id: roomId },
        { messages: [...room.messages, message._id] },
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
        { $addToSet: { users: [user] } },
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
