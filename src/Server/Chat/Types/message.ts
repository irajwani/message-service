export interface IMessage {
  _id: string;
  text: string;
  sender: string;
  recipient: string;
  createdAt?: string;
  updatedAt?: string;
}
