import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class SubscriptionService {
    private readonly config;
    private readonly prisma;
    private stripe;
    constructor(config: ConfigService, prisma: PrismaService);
    create(plan: string): Promise<{
        checkout_url: string;
    }>;
    webhook(req: any): Promise<{
        received: boolean;
    }>;
}
//# sourceMappingURL=subscription.service.d.ts.map