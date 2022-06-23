import { IsDefined, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsDefined()
  @IsString()
  @ApiProperty({ name: 'username', type: String })
  username: string;

  @IsDefined()
  @IsString()
  @ApiProperty({ name: 'password', type: String })
  password: string;
}
