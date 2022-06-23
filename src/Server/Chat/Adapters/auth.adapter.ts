import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AuthService } from '../../Auth/auth.service';
import { UserService } from '../../User/user.service';

export class AuthIoAdapter extends IoAdapter {
  private readonly authService: AuthService;
  private readonly userService: UserService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
    this.userService = this.app.get(UserService);
  }

  createIOServer(port: number, options?: any): any {
    options.allowRequest = async (request, allowFunction) => {
      const token = request._query?.token;

      const isVerified =
        token && (await this.authService.verifyAccessToken(token));
      const userExists =
        isVerified && (await this.userService.getUser(isVerified._id));

      if (isVerified && userExists) {
        return allowFunction(null, true);
      }

      return allowFunction('Unauthorized', false);
    };

    return super.createIOServer(port, options);
  }
}
