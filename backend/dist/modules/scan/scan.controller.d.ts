import { ScanService } from './scan.service';
export declare class ScanController {
    private readonly scanService;
    constructor(scanService: ScanService);
    start(req: any): Promise<{
        status: string;
        message: string;
        mentionsFound: number;
    }>;
    history(req: any): Promise<{
        id: string;
        user_id: string | null;
        source: string | null;
        title: string | null;
        content: string | null;
        url: string | null;
        sentiment: string | null;
        created_at: Date;
    }[]>;
    deleteMention(id: string, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteMultiple(body: {
        ids: string[];
        blacklistUrls?: string[];
    }, req: any): Promise<{
        success: boolean;
        message: string;
        count: number;
    }>;
    deleteAll(req: any): Promise<{
        success: boolean;
        message: string;
        count: number;
    }>;
}
//# sourceMappingURL=scan.controller.d.ts.map