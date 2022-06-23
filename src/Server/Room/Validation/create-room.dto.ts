import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @IsString()
  @ApiProperty({ name: 'name', description: 'Room name', type: String })
  readonly name: string;

  @IsString()
  @ApiProperty({
    name: 'description',
    description: 'Room description',
    type: String,
  })
  readonly description: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
