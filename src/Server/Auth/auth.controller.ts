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
import { Request, Response } from 'express';
import { LocalAuthGuard } from './local.guard';
import { CreateUserDto, LoginUserDto } from './Validation';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: CreateUserDto, @Res() response?: Response) {
    const user = await this.authService.register(body);
    return response.status(HttpStatus.OK).json(user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req, @Body() body: LoginUserDto) {
    return this.authService.login(req.user);
  }
}
