import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { KycModule } from './modules/kyc/kyc.module';
import { MandateModule } from './modules/mandate/mandate.module';
import { ScanModule } from './modules/scan/scan.module';
import { DeletionModule } from './modules/deletion/deletion.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { AdminModule } from './modules/admin/admin.module';
import supabaseConfig from './config/supabase.config';
import stripeConfig from './config/stripe.config';
import brevoConfig from './config/brevo.config';
import yousignConfig from './config/yousign.config';
import googleConfig from './config/google.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [supabaseConfig, stripeConfig, brevoConfig, yousignConfig, googleConfig] }),
    PrismaModule,
    AuthModule,
    UserModule,
    KycModule,
    MandateModule,
    ScanModule,
    DeletionModule,
    SubscriptionModule,
    NewsletterModule,
    AdminModule,
  ],
})
export class AppModule {}
