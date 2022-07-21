import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { JwtAuthGuard } from '../Auth/jwt.guard';
// import { OwnershipGuard } from './ownership.guard';
import { RequestWithUser } from '../../Common/Types/request-with-user';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddMessageDto } from '../Chat/Validation/add-message.dto';
import { ChatService } from './chat.service';

@Controller('chat')
@ApiTags('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('send-message')
  async sendMessage(
    @Req() req: RequestWithUser,
    @Body() addMessageDto: AddMessageDto,
    @Res() response?: Response,
  ) {
    addMessageDto.sender = req.user._id;
    const message = await this.chatService.addMessage(addMessageDto);
    return response.status(HttpStatus.OK).json(message);
  }
}
