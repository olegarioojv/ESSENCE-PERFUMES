import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';
import { CouponType } from '../entities/coupon-type.enum';

export class CreateCouponDto {
  @ApiProperty({ example: 'BEMVINDO10' })
  @IsString()
  @Matches(/^[A-Za-z0-9-]+$/, {
    message: 'code must contain only letters, numbers, and hyphens',
  })
  code: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTUAL })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({
    example: 10,
    description: 'Percentual (0-100) ou valor fixo em R$, conforme o type',
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  value: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Quantidade máxima de usos. Deixe vazio para ilimitado',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxUses?: number;

  @ApiPropertyOptional({ example: '2026-08-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
