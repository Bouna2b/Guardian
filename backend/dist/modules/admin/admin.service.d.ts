import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listUsers(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        user_id: string | null;
        document_url: string | null;
        verified: boolean;
    }[]>;
    listDeletions(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        user_id: string | null;
        created_at: Date;
        site: string | null;
        platform: string | null;
        status: string;
        updated_at: Date;
    }[]>;
    exportCsv(): Promise<string>;
}
//# sourceMappingURL=admin.service.d.ts.map