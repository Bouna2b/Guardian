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
exports.MandateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const pdfkit_1 = require("pdfkit");
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("@nestjs/config");
let MandateService = class MandateService {
    constructor(prisma, config) {
        var _a, _b, _c;
        this.prisma = prisma;
        this.config = config;
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
        const mandate = await this.prisma.mandates.findFirst({
            where: { user_id: userId },
            orderBy: { id: 'desc' },
        });
        if (!mandate) {
            return {
                status: 'not_created',
                signed: false,
                message: 'Aucun mandat créé',
                pdf_url: null,
            };
        }
        return {
            status: mandate.signed ? 'signed' : 'pending',
            signed: mandate.signed,
            message: mandate.signed
                ? 'Mandat signé'
                : 'En attente de signature',
            pdf_url: mandate.pdf_url,
        };
    }
    async create(userId) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return await new Promise(async (resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', async () => {
                try {
                    const buffer = Buffer.concat(chunks);
                    const filename = `mandates/mandate-${Date.now()}.pdf`;
                    const { data, error } = await this.supabaseAdmin.storage
                        .from('mandates')
                        .upload(filename, buffer, {
                        contentType: 'application/pdf',
                    });
                    if (error) {
                        console.error('Supabase Storage error:', error);
                        return reject(error);
                    }
                    const url = this.supabaseAdmin.storage.from('mandates').getPublicUrl(data.path).data.publicUrl;
                    await this.prisma.mandates.create({ data: { user_id: userId, pdf_url: url, signed: false } });
                    resolve({ pdf_url: url });
                }
                catch (error) {
                    console.error('Error creating mandate:', error);
                    reject(error);
                }
            });
            doc.fontSize(18).text('Guardian Mandate', { align: 'center' });
            doc.moveDown();
            doc.text('This is a generated mandate PDF.');
            doc.end();
        });
    }
    async sign(userId) {
        await this.prisma.mandates.updateMany({
            where: { user_id: userId },
            data: { signed: true },
        });
        return { signed: true, message: 'Mandat signé avec succès' };
    }
};
exports.MandateService = MandateService;
exports.MandateService = MandateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], MandateService);
//# sourceMappingURL=mandate.service.js.map