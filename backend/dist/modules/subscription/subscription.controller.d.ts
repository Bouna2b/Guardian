import { SubscriptionService } from './subscription.service';
import { Request } from 'express';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    create(body: {
        plan: string;
    }): Promise<{
        checkout_url: string;
    }>;
    webhook(req: Request): Promise<{
        received: boolean;
    }>;
}
//# sourceMappingURL=subscription.controller.d.ts.map