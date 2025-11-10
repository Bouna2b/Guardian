import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    profile(req: any): {
        id: any;
        email: any;
        first_name: any;
        last_name: any;
        phone: any;
        country: any;
        user_metadata: any;
    };
    updateProfile(req: any, body: any): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadId(file: Express.Multer.File): Promise<{
        url: any;
    }>;
}
export declare class DashboardController {
    private readonly userService;
    constructor(userService: UserService);
    getDashboard(req: any): Promise<{
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
}
//# sourceMappingURL=user.controller.d.ts.map