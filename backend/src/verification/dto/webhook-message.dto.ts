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
  customer_phone?: unknown;

  @IsOptional()
  phone_number?: unknown;

  @IsOptional()
  text?: unknown;

  @IsOptional()
  message?: unknown;

  @IsOptional()
  body?: unknown;

  @IsOptional()
  content?: unknown;

  @IsOptional()
  text_message?: unknown;

  @IsOptional()
  id?: unknown;

  @IsOptional()
  messageId?: unknown;

  @IsOptional()
  data?: unknown;

  @IsOptional()
  payload?: unknown;

  @IsOptional()
  contact?: unknown;

  [key: string]: unknown;
}
