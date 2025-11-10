"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let AuthService = class AuthService {
    constructor(config) {
        var _a, _b;
        this.config = config;
        this.supabase = (0, supabase_js_1.createClient)((_a = this.config.get('supabase.url')) !== null && _a !== void 0 ? _a : '', (_b = this.config.get('supabase.key')) !== null && _b !== void 0 ? _b : '');
    }
    async login(dto) {
        var _a;
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: dto.email,
            password: dto.password,
        });
        if (error || !data.session)
            throw new common_1.UnauthorizedException((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Invalid credentials');
        return { access_token: data.session.access_token, user: data.user };
    }
    async register(dto) {
        var _a, _b;
        const { data, error } = await this.supabase.auth.signUp({
            email: dto.email,
            password: dto.password,
            options: {
                emailRedirectTo: undefined,
                data: {
                    role: 'user',
                    first_name: dto.first_name,
                    last_name: dto.last_name,
                    phone: dto.phone,
                    dob: dto.dob,
                    country: dto.country,
                    pseudos: dto.pseudos || [],
                    keywords: dto.keywords || [],
                    gdpr_consent: dto.gdpr_consent,
                    gdpr_consent_date: new Date().toISOString(),
                    newsletter_consent: dto.newsletter_consent || false,
                }
            },
        });
        if (error)
            throw new common_1.UnauthorizedException((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Registration failed');
        if (!data.user)
            throw new common_1.UnauthorizedException('Registration failed - no user created');
        if (!data.session) {
            const { data: loginData, error: loginError } = await this.supabase.auth.signInWithPassword({
                email: dto.email,
                password: dto.password,
            });
            if (loginError || !loginData.session) {
                return {
                    user: data.user,
                    session: null,
                    access_token: null,
                    message: 'Please check your email to confirm your account',
                };
            }
            return {
                user: loginData.user,
                session: loginData.session,
                access_token: loginData.session.access_token,
            };
        }
        return {
            user: data.user,
            session: data.session,
            access_token: (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map