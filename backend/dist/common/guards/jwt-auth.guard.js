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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(config) {
        var _a, _b;
        this.config = config;
        this.supabase = (0, supabase_js_1.createClient)((_a = this.config.get('supabase.url')) !== null && _a !== void 0 ? _a : '', (_b = this.config.get('supabase.key')) !== null && _b !== void 0 ? _b : '');
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers['authorization'];
        if (!auth || !auth.startsWith('Bearer '))
            throw new common_1.UnauthorizedException('Missing bearer token');
        const token = auth.substring('Bearer '.length);
        const { data, error } = await this.supabase.auth.getUser(token);
        if (error || !(data === null || data === void 0 ? void 0 : data.user))
            throw new common_1.UnauthorizedException('Invalid token');
        request.user = data.user;
        return true;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map