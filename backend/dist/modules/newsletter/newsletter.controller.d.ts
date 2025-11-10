import { NewsletterService } from './newsletter.service';
export declare class NewsletterController {
    private readonly newsletterService;
    constructor(newsletterService: NewsletterService);
    subscribe(body: {
        email: string;
    }): Promise<{
        subscribed: boolean;
    }>;
}
//# sourceMappingURL=newsletter.controller.d.ts.map