import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  _id: string;

  @Prop()
  text: string;

  @Prop({ ref: 'User' })
  sender: string;

  @Prop({ ref: 'User' })
  recipient: string;
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);
export default { name: Message.name, schema: MessageSchema };
