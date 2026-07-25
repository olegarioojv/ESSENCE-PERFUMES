import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddFavoriteDto {
  @ApiProperty({ example: 'b3f1c2d4-...' })
  @IsUUID()
  productId: string;
}
