import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument } from '../../Schemas/user.schema';
import { CreateUserDto } from '../Auth/Validation';
import { IUser } from './Types/user';
import {
  InternalServerException,
  MongooseErrorCodes,
  UserDoesNotExistException,
  UserExistsException,
} from '../../Common/Errors';
import { IMessage } from '../Room/Types/message';
import { ChatService } from '../Chat/chat.service';
import { BlockUserDto } from './Validation/block-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userRepository: Model<UserDocument>,
    private chatService: ChatService,
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
    if (!user) throw new UserDoesNotExistException();
    return user;
  }

  public async getUserMessages(_id: string): Promise<IMessage[]> {
    return this.chatService.getUserMessages(_id);
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

  public async updateUserRoom(_id: string, roomId: string) {
    try {
      await this.userRepository.updateOne({ _id }, { room: roomId });
    } catch (e) {
      throw new UserDoesNotExistException();
    }
  }
}
