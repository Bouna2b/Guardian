import { DeletionService } from './deletion.service';
import { Response } from 'express';
export declare class DeletionController {
    private readonly deletionService;
    constructor(deletionService: DeletionService);
    createRequest(req: any, body: {
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
    getUserDeletions(req: any): Promise<{
        id: string;
        user_id: string | null;
        created_at: Date;
        site: string | null;
        platform: string | null;
        status: string;
        updated_at: Date;
    }[]>;
    getStats(req: any): Promise<{
        total: number;
        pending: number;
        sent: number;
        resolved: number;
    }>;
    exportToCSV(req: any, res: Response): Promise<void>;
    request(body: {
        site: string;
    }): Promise<{
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
//# sourceMappingURL=deletion.controller.d.ts.map