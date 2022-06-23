export interface IUser {
  _id: string;
  username: string;
  password: string;
  name: string;
  room?: string;
  blockedUsers?: string[];
}

export type TPublicUser = Omit<IUser, 'password'>;
