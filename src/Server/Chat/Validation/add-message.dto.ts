import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMessageDto {
  @IsString()
  @ApiProperty({ name: 'text', type: String })
  text: string;

  @IsOptional()
  @IsUUID()
  sender?: string;

  @IsString()
  @ApiProperty({
    name: 'recipient',
    type: String,
    description: 'recipient username',
  })
  recipient: string;
}
