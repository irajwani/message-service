import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../User/user.service';
import {
  InternalServerException,
  InvalidCredentialsException,
} from '../../Common/Errors';
import { IUser, TPublicUser } from '../User/Types/user';
import { CreateUserDto } from './Validation';
import { JwtService } from '@nestjs/jwt';
import { IAccessToken } from './Types/access_token';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  public async register(user: CreateUserDto): Promise<IAccessToken> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    const newUser: IUser = await this.userService.create(user);
    return this.generateAccessToken(newUser);
  }

  public login(user: IUser): IAccessToken {
    return this.generateAccessToken(user);
  }

  private generateAccessToken(user: IUser): IAccessToken {
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(username: string, password: string): Promise<IUser> {
    const user = await this.userService.getUserByUsername(username);
    await AuthService.verifyPassword(password, user.password);
    return user;
  }

  static async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const doesPasswordMatch = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!doesPasswordMatch) {
      throw new InvalidCredentialsException();
    }
  }

  public verifyAccessToken(accessToken: string) {
    try {
      const payload = this.jwtService.verify(accessToken);
      return payload;
    } catch (err) {
      // todo: what happens on verification fail?
      return null;
    }
  }
}
