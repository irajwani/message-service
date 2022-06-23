import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BlockUserDto {
  @IsString()
  @ApiProperty({ name: 'username', type: String })
  username: string;

  @IsMongoId()
  @IsOptional()
  userId?: string;
}
