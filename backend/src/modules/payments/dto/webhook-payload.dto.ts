import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  id: string;

  @IsString()
  event: string;

  @IsOptional()
  @IsNumber()
  apiVersion?: number;

  @IsOptional()
  @IsBoolean()
  devMode?: boolean;

  @IsObject()
  data: Record<string, unknown>;
}
