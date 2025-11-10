import { ConfigService } from '@nestjs/config';
export declare class NewsletterService {
    private readonly config;
    constructor(config: ConfigService);
    subscribe(email: string): Promise<{
        subscribed: boolean;
    }>;
}
//# sourceMappingURL=newsletter.service.d.ts.map