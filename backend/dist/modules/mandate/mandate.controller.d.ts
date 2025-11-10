import { MandateService } from './mandate.service';
export declare class MandateController {
    private readonly mandateService;
    constructor(mandateService: MandateService);
    getStatus(req: any): Promise<{
        status: string;
        signed: boolean;
        message: string;
        pdf_url: string;
    }>;
    create(req: any): Promise<unknown>;
    sign(req: any): Promise<{
        signed: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=mandate.controller.d.ts.map