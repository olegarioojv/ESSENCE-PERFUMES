import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class StockQuantityDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({ example: 'Compra do fornecedor X' })
  @IsOptional()
  @IsString()
  reason?: string;
}
