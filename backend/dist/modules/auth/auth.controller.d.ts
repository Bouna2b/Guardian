import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
//# sourceMappingURL=auth.controller.d.ts.map