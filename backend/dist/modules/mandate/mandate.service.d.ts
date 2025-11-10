import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class MandateService {
    private readonly prisma;
    private readonly config;
    private supabase;
    private supabaseAdmin;
    constructor(prisma: PrismaService, config: ConfigService);
    getStatus(userId: string): Promise<{
        status: string;
        signed: boolean;
        message: string;
        pdf_url: string;
    }>;
    create(userId: string): Promise<unknown>;
    sign(userId: string): Promise<{
        signed: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=mandate.service.d.ts.map