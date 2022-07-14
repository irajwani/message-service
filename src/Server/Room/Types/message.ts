export interface IMessage {
  _id: string;
  text: string;
  sender: string;
  recipient: string;
  room: string;
  createdAt?: string;
  updatedAt?: string;
}
