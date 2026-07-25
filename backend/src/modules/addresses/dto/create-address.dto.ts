import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Casa' })
  @IsString()
  @MinLength(1)
  label: string;

  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @MinLength(2)
  recipientName: string;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  @MinLength(8)
  phone: string;

  @ApiProperty({ example: '01310-000' })
  @IsString()
  @MinLength(5)
  zipCode: string;

  @ApiProperty({ example: 'Av. Paulista' })
  @IsString()
  @MinLength(1)
  street: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  number: string;

  @ApiPropertyOptional({ example: 'Apto 101' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ example: 'Bela Vista' })
  @IsString()
  @MinLength(1)
  neighborhood: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @MinLength(1)
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @MinLength(2)
  state: string;

  @ApiPropertyOptional({ example: 'BR', default: 'BR' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
