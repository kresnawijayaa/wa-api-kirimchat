import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateVerificationDto {
  @IsString()
  @IsNotEmpty({ message: 'Nomor WhatsApp wajib diisi.' })
  @MinLength(9, { message: 'Nomor WhatsApp terlalu pendek.' })
  phone!: string;
}
