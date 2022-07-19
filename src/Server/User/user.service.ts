import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../../Schemas/user.schema';
import { CreateUserDto } from '../Auth/Validation';
import { IUser } from './Types/user';
import {
  InternalServerException,
  MongooseErrorCodes,
  NoMessagesException,
  UserDoesNotExistException,
  UserExistsException,
} from '../../Common/Errors';
import { IMessage } from '../Chat/Types/message';
import { BlockUserDto } from './Validation/block-user.dto';
import { Message, MessageDocument } from '../../Schemas/message.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
    @InjectModel(Message.name)
    private messageRepository: Model<MessageDocument>,
  ) {}

  public async create(user: CreateUserDto): Promise<IUser> {
    try {
      return await this.userRepository.create({ _id: uuidv4(), ...user });
    } catch (e) {
      if (e.code === MongooseErrorCodes.UniquePropViolation) {
        throw new UserExistsException();
      }
      console.log(e);
      throw new InternalServerException();
    }
  }

  public async getUserByUsername(username: string): Promise<IUser> {
    const user: IUser = await this.userRepository.findOne({
      username,
    });
    if (!user) throw new UserDoesNotExistException();
    return user;
  }

  public async getUser(_id: string): Promise<IUser> {
    const user: IUser = await this.userRepository.findById({ _id }).lean();
    if (!user) throw new NotFoundException();
    return user;
  }

  public async getUserMessages(_id: string): Promise<IMessage[]> {
    const messages = await this.messageRepository
      .find({ $or: [{ sender: _id }, { recipient: _id }] })
      .lean();
    if (!messages) throw new NoMessagesException();
    return messages;
  }

  public async blockUser({ username, userId }: BlockUserDto): Promise<void> {
    try {
      const { _id: blockedUserId } = await this.getUserByUsername(username);
      await this.userRepository.updateOne(
        { _id: userId },
        { $addToSet: { blockedUsers: [blockedUserId] } },
      );
      return;
    } catch (e) {
      throw new UserDoesNotExistException();
    }
  }
}
