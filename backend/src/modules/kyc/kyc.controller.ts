import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { KycService } from './kyc.service';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('status')
  async getStatus(@Req() req: any) {
    const userId = req.user?.id;
    return this.kycService.getStatus(userId);
  }

  @Get('upload-url')
  getUploadUrl(@Query('filename') filename: string, @Query('contentType') contentType: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.kycService.getUploadUrl(userId, filename, contentType);
  }

  @Post('submit')
  submit(@Body() body: { fileRefs: any }, @Req() req: any) {
    const userId = req.user?.id;
    return this.kycService.submitKyc(userId, body.fileRefs);
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.kycService.handleWebhook(body);
  }
}
