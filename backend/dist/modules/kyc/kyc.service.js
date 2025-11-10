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
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const prisma_service_1 = require("../../prisma/prisma.service");
let KycService = class KycService {
    constructor(config, prisma) {
        var _a, _b, _c;
        this.config = config;
        this.prisma = prisma;
        this.supabase = (0, supabase_js_1.createClient)((_a = this.config.get('supabase.url')) !== null && _a !== void 0 ? _a : '', (_b = this.config.get('supabase.key')) !== null && _b !== void 0 ? _b : '');
        const serviceRoleKey = this.config.get('supabase.serviceRoleKey');
        if (serviceRoleKey) {
            this.supabaseAdmin = (0, supabase_js_1.createClient)((_c = this.config.get('supabase.url')) !== null && _c !== void 0 ? _c : '', serviceRoleKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });
        }
        else {
            console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not configured, using anon key');
            this.supabaseAdmin = this.supabase;
        }
    }
    async getStatus(userId) {
        const identity = await this.prisma.identities.findFirst({
            where: { user_id: userId },
            orderBy: { id: 'desc' },
        });
        if (!identity) {
            return {
                status: 'not_started',
                verified: false,
                message: 'Aucune vérification en cours',
            };
        }
        return {
            status: identity.verified ? 'verified' : 'pending',
            verified: identity.verified,
            message: identity.verified
                ? 'Identité vérifiée'
                : 'Vérification en cours',
        };
    }
    async getUploadUrl(userId, filename, contentType) {
        const bucket = 'kyc-documents';
        const filePath = `${userId}/${Date.now()}-${filename}`;
        try {
            const { data, error } = await this.supabaseAdmin.storage
                .from(bucket)
                .createSignedUploadUrl(filePath);
            if (error) {
                console.error('Supabase Storage error:', error);
                throw new Error(`Failed to generate upload URL: ${error.message}`);
            }
            return {
                uploadUrl: data.signedUrl,
                fileKey: filePath,
                token: data.token,
            };
        }
        catch (error) {
            console.error('Error in getUploadUrl:', error);
            throw error;
        }
    }
    async submitKyc(userId, fileRefs) {
        await this.prisma.identities.create({
            data: {
                user_id: userId,
                document_url: JSON.stringify(fileRefs),
                verified: false,
            },
        });
        return {
            kyc_status: 'pending',
            message: 'Documents soumis pour vérification',
        };
    }
    async handleWebhook(body) {
        const { user_id, status } = body;
        await this.prisma.identities.updateMany({
            where: { user_id },
            data: { verified: status === 'verified' },
        });
        return { received: true };
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], KycService);
//# sourceMappingURL=kyc.service.js.map