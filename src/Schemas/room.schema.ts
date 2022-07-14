import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IMessage } from '../Server/Room/Types/message';

const { ObjectId } = MongooseSchema.Types;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true })
  _id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ ref: 'User' })
  createdBy: string;

  @Prop({ ref: 'User' })
  users: string[];

  @Prop({ ref: 'User' })
  bannedUsers: string[];

  @Prop({ type: [ObjectId], ref: 'Message' })
  messages: IMessage[] | [];
}

export type RoomDocument = Room & Document;
export const RoomSchema = SchemaFactory.createForClass(Room);
