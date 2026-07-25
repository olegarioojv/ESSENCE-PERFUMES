import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Chanel' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'Maison de luxo francesa fundada em 1910' })
  @IsOptional()
  @IsString()
  description?: string;
}
