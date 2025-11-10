import { PrismaService } from '../../prisma/prisma.service';
export declare class DeletionService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createRequest(userId: string, data: {
        site: string;
        platform: string;
        url?: string;
    }): Promise<{
        id: string;
        user_id: string | null;
        created_at: Date;
        site: string | null;
        platform: string | null;
        status: string;
        updated_at: Date;
    }>;
    getUserDeletions(userId: string): Promise<{
        id: string;
        user_id: string | null;
        created_at: Date;
        site: string | null;
        platform: string | null;
        status: string;
        updated_at: Date;
    }[]>;
    getStats(userId: string): Promise<{
        total: number;
        pending: number;
        sent: number;
        resolved: number;
    }>;
    exportToCSV(userId: string): Promise<string>;
    request(site: string): Promise<{
        id: string;
        status: string;
    }>;
    status(id: string): Promise<{
        id: string;
        user_id: string | null;
        created_at: Date;
        site: string | null;
        platform: string | null;
        status: string;
        updated_at: Date;
    }>;
}
//# sourceMappingURL=deletion.service.d.ts.map