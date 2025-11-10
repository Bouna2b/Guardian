import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class KycService {
    private readonly config;
    private readonly prisma;
    private supabase;
    private supabaseAdmin;
    constructor(config: ConfigService, prisma: PrismaService);
    getStatus(userId: string): Promise<{
        status: string;
        verified: boolean;
        message: string;
    }>;
    getUploadUrl(userId: string, filename: string, contentType: string): Promise<{
        uploadUrl: any;
        fileKey: string;
        token: any;
    }>;
    submitKyc(userId: string, fileRefs: any): Promise<{
        kyc_status: string;
        message: string;
    }>;
    handleWebhook(body: any): Promise<{
        received: boolean;
    }>;
}
//# sourceMappingURL=kyc.service.d.ts.map