export declare class RegisterDto {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone?: string;
    dob: string;
    country: string;
    pseudos?: Array<{
        platform: string;
        handle: string;
    }>;
    keywords?: string[];
    gdpr_consent: boolean;
    newsletter_consent?: boolean;
}
//# sourceMappingURL=register.dto.d.ts.map