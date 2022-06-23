import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { RoomService } from './room.service';

import { JwtAuthGuard } from '../Auth/jwt.guard';
import { OwnershipGuard } from './ownership.guard';
import { CreateRoomDto } from './Validation';
import { RequestWithUser } from '../../Common/Types/request-with-user';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AddMessageDto } from '../Chat/Validation/add-message.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() response?: Response) {
    const room = await this.roomService.getRoomById(id);
    return response.status(HttpStatus.OK).json(room);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async find(@Res() response?: Response) {
    const rooms = await this.roomService.findAll();
    return response.status(HttpStatus.OK).json(rooms);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createRoomDto: CreateRoomDto,
    @Res() response?: Response,
  ) {
    createRoomDto.createdBy = req.user._id;
    const room = await this.roomService.create(createRoomDto);
    return response.status(HttpStatus.CREATED).json(room);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiBearerAuth()
  @Patch(':id/join')
  async joinRoom(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Res() response?: Response,
  ) {
    const user = req.user._id;
    await this.roomService.updateRoomWithUser({
      roomId: id,
      user,
    });
    return response.status(HttpStatus.OK).json({
      message: `User with ID: ${user} has joined room with ID: ${id}`,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/send-message')
  async sendMessage(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() addMessageDto: AddMessageDto,
    @Res() response?: Response,
  ) {
    addMessageDto.sender = req.user._id;
    addMessageDto.roomId = id;
    const message = await this.roomService.addMessage(addMessageDto);
    return response.status(HttpStatus.OK).json(message);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }
}
