import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { UserModule } from '../User/user.module';
import { Room, RoomSchema } from '../../Schemas/room.schema';
import { Message, MessageSchema } from '../../Schemas/message.schema';
import { ChatModule } from "../Chat/chat.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    UserModule,
    ChatModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
