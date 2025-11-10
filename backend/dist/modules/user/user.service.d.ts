import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class UserService {
    private readonly config;
    private readonly prisma;
    private supabase;
    private supabaseAdmin;
    constructor(config: ConfigService, prisma: PrismaService);
    getProfile(user: any): {
        id: any;
        email: any;
        first_name: any;
        last_name: any;
        phone: any;
        country: any;
        user_metadata: any;
    };
    updateProfile(userId: string, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getDashboardData(userId: string): Promise<{
        guardianScore: number;
        mentionsCount: number;
        deletionsCount: number;
        positiveMentions: number;
        negativeMentions: number;
        neutralMentions: number;
        alerts: number;
        mentions: {
            id: string;
            source: string;
            title: string;
            snippet: string;
            sentiment: string;
            url: string;
            date: string;
        }[];
        deletions: {
            id: string;
            platform: string;
            status: string;
            created_at: string;
            updated_at: string;
        }[];
        accountStatus: {
            kyc_status: string;
            mandate_signed: boolean;
            alerts_enabled: boolean;
        };
    }>;
    uploadId(file: Express.Multer.File): Promise<{
        url: any;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map