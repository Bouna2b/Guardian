import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly config;
    private supabase;
    constructor(config: ConfigService);
    login(dto: LoginDto): Promise<{
        access_token: any;
        user: any;
    }>;
    register(dto: RegisterDto): Promise<{
        user: any;
        session: any;
        access_token: any;
        message: string;
    } | {
        user: any;
        session: any;
        access_token: any;
        message?: undefined;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map