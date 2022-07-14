import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../Auth/auth.module';
import { RoomModule } from '../Room/room.module';
import { ChatService } from './chat.service';

import { Message, MessageSchema } from '../../Schemas/message.schema';
import { UserService } from '../User/user.service';
import { User, UserSchema } from '../../Schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    RoomModule,
  ],
  providers: [ChatGateway, ChatService, UserService],
  exports: [ChatGateway, ChatService],
})
export class ChatModule {}
