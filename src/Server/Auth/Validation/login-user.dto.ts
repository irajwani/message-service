import { IsDefined, IsString } from 'class-validator';

export class LoginUserDto {
  @IsDefined()
  @IsString()
  username: string;

  @IsDefined()
  @IsString()
  password: string;
}
