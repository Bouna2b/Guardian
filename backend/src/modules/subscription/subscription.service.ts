import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    this.stripe = new Stripe(this.config.get<string>('stripe.secretKey') ?? '', { apiVersion: '2024-06-20' });
  }

  async create(plan: string) {
    const price = plan === 'pro' ? 'price_pro_placeholder' : 'price_free_placeholder';
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });
    return { checkout_url: session.url };
  }

  async webhook(req: any) {
    // Stub: verify signature if needed; update subscription status
    return { received: true };
  }
}
