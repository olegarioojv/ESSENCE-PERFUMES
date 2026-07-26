import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiPropertyOptional({ example: 'BEMVINDO10' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
