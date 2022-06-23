import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateRoomDto {
  @IsMongoId()
  roomId: string;

  @IsMongoId()
  user: string;
}
