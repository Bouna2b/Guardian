import { KycService } from './kyc.service';
export declare class KycController {
    private readonly kycService;
    constructor(kycService: KycService);
    getStatus(req: any): Promise<{
        status: string;
        verified: boolean;
        message: string;
    }>;
    getUploadUrl(filename: string, contentType: string, req: any): Promise<{
        uploadUrl: any;
        fileKey: string;
        token: any;
    }>;
    submit(body: {
        fileRefs: any;
    }, req: any): Promise<{
        kyc_status: string;
        message: string;
    }>;
    webhook(body: any): Promise<{
        received: boolean;
    }>;
}
//# sourceMappingURL=kyc.controller.d.ts.map