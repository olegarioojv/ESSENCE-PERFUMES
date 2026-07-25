import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({
    example: 25,
    description: 'Nova quantidade absoluta em estoque',
  })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 'Correção após divergência no sistema' })
  @IsOptional()
  @IsString()
  reason?: string;
}
