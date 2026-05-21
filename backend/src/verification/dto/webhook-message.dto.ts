import { IsOptional } from 'class-validator';

export class WebhookMessageDto {
  @IsOptional()
  message_id?: unknown;

  @IsOptional()
  from?: unknown;

  @IsOptional()
  sender?: unknown;

  @IsOptional()
  phone?: unknown;

  @IsOptional()
  text?: unknown;

  @IsOptional()
  message?: unknown;

  @IsOptional()
  body?: unknown;

  @IsOptional()
  id?: unknown;

  @IsOptional()
  data?: unknown;

  @IsOptional()
  payload?: unknown;

  @IsOptional()
  contact?: unknown;

  [key: string]: unknown;
}
