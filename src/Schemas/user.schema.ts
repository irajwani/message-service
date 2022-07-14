import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

const { ObjectId } = MongooseSchema.Types;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  _id: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ ref: 'Room', required: false })
  room: string;

  @Prop({ ref: 'User', default: [], required: false })
  blockedUsers: string[];
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
