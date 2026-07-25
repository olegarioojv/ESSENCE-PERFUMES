import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Senha123' })
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'password must contain at least one letter and one number',
  })
  password: string;
}
