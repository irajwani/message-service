import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../Auth/auth.module';
import { ChatService } from './chat.service';

import { Message, MessageSchema } from '../../Schemas/message.schema';
import { User, UserSchema } from '../../Schemas/user.schema';
import { UserModule } from '../User/user.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
