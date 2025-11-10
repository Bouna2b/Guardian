import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';
import { Request } from 'express';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(@Body() body: { plan: string }) {
    return this.subscriptionService.create(body.plan ?? 'free');
  }

  @Post('webhook')
  async webhook(@Req() req: Request) {
    return this.subscriptionService.webhook(req);
  }
}
