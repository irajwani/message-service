export interface IMessage {
  _id: string;
  text: string;
  user: string;
  room: string;
  createdAt?: string;
  updatedAt?: string;
}
