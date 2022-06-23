import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../Schemas/user.schema';
import { ChatService } from '../Chat/chat.service';
import { Message, MessageSchema } from '../../Schemas/message.schema';
import { UserController } from './user.controller';
import { LogService } from '../Log/log.service';
import { Log, LogSchema } from '../../Schemas/log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Log.name, schema: LogSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, ChatService, LogService],
  exports: [UserService, LogService],
})
export class UserModule {}
