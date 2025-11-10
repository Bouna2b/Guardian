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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto_1 = require("crypto");
let UserService = class UserService {
    constructor(config, prisma) {
        var _a, _b, _c;
        this.config = config;
        this.prisma = prisma;
        this.supabase = (0, supabase_js_1.createClient)((_a = this.config.get('supabase.url')) !== null && _a !== void 0 ? _a : '', (_b = this.config.get('supabase.key')) !== null && _b !== void 0 ? _b : '');
        const serviceRoleKey = this.config.get('supabase.serviceRoleKey');
        if (serviceRoleKey) {
            this.supabaseAdmin = (0, supabase_js_1.createClient)((_c = this.config.get('supabase.url')) !== null && _c !== void 0 ? _c : '', serviceRoleKey);
        }
        else {
            console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will use regular client.');
            this.supabaseAdmin = this.supabase;
        }
    }
    getProfile(user) {
        var _a, _b, _c, _d, _e, _f;
        return {
            id: user === null || user === void 0 ? void 0 : user.id,
            email: user === null || user === void 0 ? void 0 : user.email,
            first_name: ((_a = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _a === void 0 ? void 0 : _a.first_name) || ((_b = user === null || user === void 0 ? void 0 : user.app_metadata) === null || _b === void 0 ? void 0 : _b.first_name),
            last_name: ((_c = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _c === void 0 ? void 0 : _c.last_name) || ((_d = user === null || user === void 0 ? void 0 : user.app_metadata) === null || _d === void 0 ? void 0 : _d.last_name),
            phone: (_e = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _e === void 0 ? void 0 : _e.phone,
            country: (_f = user === null || user === void 0 ? void 0 : user.user_metadata) === null || _f === void 0 ? void 0 : _f.country,
            user_metadata: user === null || user === void 0 ? void 0 : user.user_metadata,
        };
    }
    async updateProfile(userId, data) {
        const { error } = await this.supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone,
                dob: data.dob,
                city: data.city,
                country: data.country,
                profession: data.profession,
                linkedin: data.linkedin,
                facebook: data.facebook,
                instagram: data.instagram,
                twitter: data.twitter,
                pseudos: data.pseudos || [],
                keywords: data.keywords || [],
                exclusions: data.exclusions || [],
            },
        });
        if (error) {
            throw new Error(`Failed to update profile: ${error.message}`);
        }
        return { success: true, message: 'Profile updated successfully' };
    }
    async getDashboardData(userId) {
        const scans = await this.prisma.scans.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        const deletions = await this.prisma.deletions.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        const identity = await this.prisma.identities.findFirst({
            where: { user_id: userId },
        });
        const totalMentions = scans.length;
        const positiveMentions = scans.filter((s) => s.sentiment === 'positive').length;
        const negativeMentions = scans.filter((s) => s.sentiment === 'negative').length;
        const neutralMentions = scans.filter((s) => s.sentiment === 'neutral').length;
        const pendingDeletions = deletions.filter((d) => d.status === 'pending').length;
        const completedDeletions = deletions.filter((d) => d.status === 'completed').length;
        let guardianScore = 50;
        if (totalMentions > 0) {
            const positiveRatio = positiveMentions / totalMentions;
            const negativeRatio = negativeMentions / totalMentions;
            guardianScore = Math.round(50 + (positiveRatio * 30) - (negativeRatio * 30) + (completedDeletions * 2));
            guardianScore = Math.max(0, Math.min(100, guardianScore));
        }
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentAlerts = scans.filter((s) => s.sentiment === 'negative' && s.created_at && s.created_at >= sevenDaysAgo).length;
        return {
            guardianScore,
            mentionsCount: totalMentions,
            deletionsCount: pendingDeletions,
            positiveMentions,
            negativeMentions,
            neutralMentions,
            alerts: recentAlerts,
            mentions: scans.slice(0, 10).map((s) => {
                var _a;
                return ({
                    id: s.id,
                    source: s.source || 'Web',
                    title: s.title || `Mention trouvée`,
                    snippet: s.content || '',
                    sentiment: s.sentiment || 'neutral',
                    url: s.url || '',
                    date: ((_a = s.created_at) === null || _a === void 0 ? void 0 : _a.toISOString()) || new Date().toISOString(),
                });
            }),
            deletions: deletions.slice(0, 5).map((d) => {
                var _a, _b;
                return ({
                    id: d.id,
                    platform: d.platform || 'Unknown',
                    status: d.status,
                    created_at: (_a = d.created_at) === null || _a === void 0 ? void 0 : _a.toISOString(),
                    updated_at: (_b = d.updated_at) === null || _b === void 0 ? void 0 : _b.toISOString(),
                });
            }),
            accountStatus: {
                kyc_status: (identity === null || identity === void 0 ? void 0 : identity.verified) ? 'verified' : 'pending',
                mandate_signed: !!identity,
                alerts_enabled: true,
            },
        };
    }
    async uploadId(file) {
        if (!file)
            throw new common_1.BadRequestException('File required');
        const bucket = 'identities';
        const filename = `${(0, crypto_1.randomUUID)()}-${file.originalname}`;
        const { data, error } = await this.supabase.storage.from(bucket).upload(filename, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error)
            throw new common_1.BadRequestException(error.message);
        const publicUrl = this.supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
        await this.prisma.identities.create({ data: { document_url: publicUrl } });
        return { url: publicUrl };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map