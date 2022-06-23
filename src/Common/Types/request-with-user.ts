import { Request } from 'express';
import { IUser } from '../../Server/User/Types/user';

export interface RequestWithUser extends Request {
  user: IUser;
}
