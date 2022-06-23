import { IsDefined, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsDefined()
  @IsString()
  @ApiProperty({ name: 'username', type: String })
  username: string;

  @IsDefined()
  @IsString()
  @ApiProperty({ name: 'password', type: String })
  password: string;

  @IsDefined()
  @IsString()
  @ApiProperty({ name: 'name', type: String, description: 'Full name' })
  name: string;
}
