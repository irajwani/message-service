import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { LogTypes } from '../Server/Log/Types/log';

const { ObjectId } = MongooseSchema.Types;

@Schema({ timestamps: true })
export class Log {
  @Prop({ required: true })
  _id: string;

  @Prop()
  text: string;

  @Prop()
  action: string;

  @Prop({ enum: LogTypes })
  type: string;

  @Prop({ ref: 'User' })
  user: string;
}

export type LogDocument = Log & Document;
export const LogSchema = SchemaFactory.createForClass(Log);
