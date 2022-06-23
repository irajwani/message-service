import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IMessage } from '../Server/Room/Types/message';

const { ObjectId } = MongooseSchema.Types;

@Schema({ timestamps: true })
export class Room {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: ObjectId, ref: 'User' })
  createdBy: string;

  @Prop({ type: [ObjectId], ref: 'User' })
  users: string[];

  @Prop({ type: [ObjectId], ref: 'User' })
  bannedUsers: string[];

  @Prop({ type: [ObjectId], ref: 'Message' })
  messages: IMessage[] | [];
}

export type RoomDocument = Room & Document;
export const RoomSchema = SchemaFactory.createForClass(Room);
