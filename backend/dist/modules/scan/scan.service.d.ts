import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ScanService {
    private readonly prisma;
    private readonly config;
    private supabase;
    private supabaseAdmin;
    constructor(prisma: PrismaService, config: ConfigService);
    startScan(userId: string): Promise<{
        status: string;
        message: string;
        mentionsFound: number;
    }>;
    private performWebSearch;
    private analyzeSentiment;
    getHistory(userId: string): Promise<{
        id: string;
        user_id: string | null;
        source: string | null;
        title: string | null;
        content: string | null;
        url: string | null;
        sentiment: string | null;
        created_at: Date;
    }[]>;
    deleteMention(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteMultipleMentions(ids: string[], userId: string, blacklistUrls?: string[]): Promise<{
        success: boolean;
        message: string;
        count: number;
    }>;
    deleteAllMentions(userId: string): Promise<{
        success: boolean;
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=scan.service.d.ts.map