import { AdminService } from './admin.service';
import { Response } from 'express';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    users(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        user_id: string | null;
        document_url: string | null;
        verified: boolean;
    }[]>;
    deletions(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        user_id: string | null;
        created_at: Date;
        site: string | null;
        platform: string | null;
        status: string;
        updated_at: Date;
    }[]>;
    exportCsv(res: Response): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map