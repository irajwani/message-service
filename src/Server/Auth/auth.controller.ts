import {
  Controller,
  Req,
  Post,
  UseGuards,
  Res,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './local.guard';
import { CreateUserDto, LoginUserDto } from './Validation';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from '../../Common/Types/request-with-user';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: CreateUserDto, @Res() response?: Response) {
    const accessToken = await this.authService.register(body);
    return response.status(HttpStatus.OK).json(accessToken);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: RequestWithUser,
    @Body() body: LoginUserDto,
    @Res() response?: Response,
  ) {
    const accessToken = await this.authService.login(req.user);
    return response.status(HttpStatus.OK).json(accessToken);
  }
}
