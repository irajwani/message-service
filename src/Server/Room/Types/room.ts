import { IMessage } from './message';

export interface IRoom {
  _id?: string;
  name: string;
  description: string;
  createdBy: string;
  users?: string[];
  messages?: IMessage[] | string[];
  bannedUsers?: string[];
  createdAt?: string;
  updatedAt?: string;
}
