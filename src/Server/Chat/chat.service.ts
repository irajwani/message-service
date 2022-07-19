import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Message, MessageDocument } from '../../Schemas/message.schema';
import { UserService } from '../User/user.service';
import { AddMessageDto } from '../Chat/Validation/add-message.dto';
import { IMessage } from './Types/message';

import { BlockedUserException } from '../../Common/Errors';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private messageRepository: Model<MessageDocument>,
    private readonly userService: UserService,
  ) {}

  async addMessage(addMessageDto: AddMessageDto): Promise<IMessage> {
    try {
      const { sender, recipient: recipientUserName, text } = addMessageDto;

      const { _id: senderId } = await this.userService.getUser(sender);

      // todo: this service should utilize DB transactions to ensure atomicity of DB across multiple DB operations.

      const { _id: recipientId, blockedUsers } =
        await this.userService.getUserByUsername(recipientUserName);

      if (blockedUsers.includes(senderId)) throw new BlockedUserException();

      const message: IMessage = await this.messageRepository.create({
        _id: uuidv4(),
        text,
        sender: senderId,
        recipient: recipientId,
      });
      return message;
    } catch (err) {
      throw err;
    }
  }

  // async remove(id: string) {
  //   const room = await this.getRoomById(id);
  //   return this.roomRepository.remove(room);
  // }
}
