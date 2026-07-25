import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import { OlfactoryFamily } from '../entities/olfactory-family.enum';

export class CreateProductDto {
  @ApiProperty({ example: 'Chanel Nº 5 Eau de Parfum 100ml' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'CHN5-100' })
  @IsString()
  @MinLength(1)
  sku: string;

  @ApiPropertyOptional({
    example: 'chanel-no5-100ml',
    description: 'Gerado automaticamente a partir do nome se não informado',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase, alphanumeric, and hyphen-separated',
  })
  slug?: string;

  @ApiPropertyOptional({ example: '7891234567890' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: '7891234567890' })
  @IsOptional()
  @IsString()
  ean?: string;

  @ApiPropertyOptional({ example: 'Fragrância floral aldeídica icônica' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 899.9 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: 749.9 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  promotionalPrice?: number;

  @ApiPropertyOptional({ example: '2026-08-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  promotionStartsAt?: string;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  promotionEndsAt?: string;

  @ApiProperty({ example: 'b3f1c2d4-...' })
  @IsUUID()
  brandId: string;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  volumeMl?: number;

  @ApiPropertyOptional({ example: 350 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  weightGrams?: number;

  @ApiPropertyOptional({
    enum: OlfactoryFamily,
    example: OlfactoryFamily.FLORAL,
  })
  @IsOptional()
  @IsEnum(OlfactoryFamily)
  olfactoryFamily?: OlfactoryFamily;

  @ApiPropertyOptional({ example: ['Bergamota', 'Jasmim', 'Baunilha'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notes?: string[];

  @ApiPropertyOptional({ example: 'Chanel Nº 5 100ml | Essence Perfumes' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Compre Chanel Nº 5 com o melhor preço' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
