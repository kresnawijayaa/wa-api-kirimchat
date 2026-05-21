import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { CreateVerificationDto } from './dto/create-verification.dto';
import { WebhookMessageDto } from './dto/webhook-message.dto';
import { VerificationService } from './verification.service';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('verification/request')
  createRequest(@Body() dto: CreateVerificationDto) {
    return this.verificationService.createRequest(dto.phone);
  }

  @Get('verification/:id')
  getDetail(@Param('id') id: string) {
    return this.verificationService.getDetail(id);
  }

  @Get('verification/:id/status')
  getStatus(@Param('id') id: string) {
    return this.verificationService.getStatus(id);
  }

  @Post('webhook/kirim-chat')
  handleKirimChatWebhook(
    @Body() dto: WebhookMessageDto,
    @Headers('x-webhook-secret') webhookSecret?: string,
  ) {
    const expectedSecret = process.env.KIRIM_CHAT_WEBHOOK_SECRET;

    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.warn('Webhook KirimChat rejected: x-webhook-secret tidak cocok.');
      throw new UnauthorizedException('Webhook secret tidak valid.');
    }

    console.log('Webhook KirimChat received.');
    return this.verificationService.handleWebhook(dto as Record<string, unknown>);
  }
}
