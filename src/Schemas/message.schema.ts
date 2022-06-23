import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

const { ObjectId } = MongooseSchema.Types;

@Schema({ timestamps: true })
export class Message {
  @Prop()
  text: string;

  @Prop({ type: ObjectId, ref: 'User' })
  user: string;

  @Prop({ type: ObjectId, ref: 'Room' })
  room: string;
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);
