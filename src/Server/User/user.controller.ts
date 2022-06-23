import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../Auth/jwt.guard';
import { BlockUserDto } from './Validation/block-user.dto';
import { RequestWithUser } from '../../Common/Types/request-with-user';
import { LogService } from '../Log/log.service';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logService: LogService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async getUser(@Param('id') id: string, @Res() response?: Response) {
    const user = await this.userService.getUser(id);
    return response.status(HttpStatus.OK).json(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/messages')
  async getUserMessages(@Param('id') id: string, @Res() response?: Response) {
    const messages = await this.userService.getUserMessages(id);
    return response.status(HttpStatus.OK).json(messages);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('block-user')
  async blockUser(
    @Req() req: RequestWithUser,
    @Body() body: BlockUserDto,
    @Res() response?: Response,
  ) {
    body.userId = req.user._id;
    await this.userService.blockUser(body);
    return response.status(HttpStatus.OK).json({
      message: `User with username ${body.username} has been blocked by ${req.user.username}`,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/logs')
  async getUserLogs(@Param('id') id: string, @Res() response?: Response) {
    const logs = await this.logService.getLogsByUser(id);
    return response.status(HttpStatus.OK).json(logs);
  }
}
