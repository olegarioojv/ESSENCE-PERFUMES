import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateStockSettingsDto {
  @ApiProperty({
    example: 5,
    description: 'Quantidade mínima antes do alerta de baixo estoque',
  })
  @IsInt()
  @Min(0)
  minQuantity: number;
}
