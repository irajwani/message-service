import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from '../../Schemas/message.schema';
import { Model } from 'mongoose';
import { IMessage } from '../Room/Types/message';
import { NoMessagesException } from '../../Common/Errors';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private messageRepository: Model<MessageDocument>,
  ) {}

  public async getUserMessages(user: string): Promise<IMessage[]> {
    const messages = await this.messageRepository
      .find({ $or: [{ sender: user }, { recipient: user }] })
      .lean();
    if (!messages) throw new NoMessagesException();
    return messages;
  }
}
