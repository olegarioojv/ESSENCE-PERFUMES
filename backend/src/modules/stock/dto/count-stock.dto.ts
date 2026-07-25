import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CountStockDto {
  @ApiProperty({ example: 48, description: 'Quantidade contada fisicamente' })
  @IsInt()
  @Min(0)
  countedQuantity: number;

  @ApiPropertyOptional({ example: 'Inventário mensal de julho/2026' })
  @IsOptional()
  @IsString()
  reason?: string;
}
