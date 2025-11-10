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
exports.DeletionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DeletionService = class DeletionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRequest(userId, data) {
        if (!data.site)
            throw new common_1.BadRequestException('site required');
        if (!data.platform)
            throw new common_1.BadRequestException('platform required');
        const deletion = await this.prisma.deletions.create({
            data: {
                user_id: userId,
                site: data.site,
                platform: data.platform,
                status: 'pending',
            },
        });
        return deletion;
    }
    async getUserDeletions(userId) {
        const deletions = await this.prisma.deletions.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        return deletions;
    }
    async getStats(userId) {
        const deletions = await this.prisma.deletions.findMany({
            where: { user_id: userId },
        });
        const total = deletions.length;
        const pending = deletions.filter(d => d.status === 'pending').length;
        const sent = deletions.filter(d => d.status === 'sent').length;
        const resolved = deletions.filter(d => d.status === 'resolved').length;
        return { total, pending, sent, resolved };
    }
    async exportToCSV(userId) {
        const deletions = await this.prisma.deletions.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        const csv = [
            'ID,Site,Plateforme,Statut,Date de création,Dernière mise à jour',
            ...deletions.map(d => `${d.id},${d.site},${d.platform},${d.status},${d.created_at.toISOString()},${d.updated_at.toISOString()}`)
        ].join('\n');
        return csv;
    }
    async request(site) {
        if (!site)
            throw new common_1.BadRequestException('site required');
        const rec = await this.prisma.deletions.create({ data: { site } });
        return { id: rec.id, status: rec.status };
    }
    async status(id) {
        if (!id)
            throw new common_1.BadRequestException('id required');
        const rec = await this.prisma.deletions.findUnique({ where: { id } });
        if (!rec)
            throw new common_1.BadRequestException('not found');
        return rec;
    }
};
exports.DeletionService = DeletionService;
exports.DeletionService = DeletionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeletionService);
//# sourceMappingURL=deletion.service.js.map