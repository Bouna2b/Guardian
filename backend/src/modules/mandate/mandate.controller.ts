import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MandateService } from './mandate.service';

@Controller('mandate')
@UseGuards(JwtAuthGuard)
export class MandateController {
  constructor(private readonly mandateService: MandateService) {}

  @Get('status')
  async getStatus(@Req() req: any) {
    const userId = req.user?.id;
    return this.mandateService.getStatus(userId);
  }

  @Post('create')
  create(@Req() req: any) {
    const userId = req.user?.id;
    return this.mandateService.create(userId);
  }

  @Post('sign')
  sign(@Req() req: any) {
    const userId = req.user?.id;
    return this.mandateService.sign(userId);
  }
}
