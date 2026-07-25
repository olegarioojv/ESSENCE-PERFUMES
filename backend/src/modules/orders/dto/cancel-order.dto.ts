import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({ example: 'Cliente desistiu da compra' })
  @IsOptional()
  @IsString()
  reason?: string;
}
