import { IUser } from '../../Server/User/Types/user';

export const formatUser = (user: IUser): IUser => ({
  ...user,
  _id: user._id.toString(),
  room: user.room.toString(),
});
