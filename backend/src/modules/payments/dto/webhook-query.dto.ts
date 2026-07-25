import { IsString } from 'class-validator';

export class WebhookQueryDto {
  @IsString()
  webhookSecret: string;
}
