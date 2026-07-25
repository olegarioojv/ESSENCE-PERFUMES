import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Perfumes Femininos' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    example: 'perfumes-femininos',
    description: 'Gerado automaticamente a partir do nome se não informado',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, and hyphen-separated',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Fragrâncias femininas de todas as marcas' })
  @IsOptional()
  @IsString()
  description?: string;
}
