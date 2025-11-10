import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeletionService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(userId: string, data: { site: string; platform: string; url?: string }) {
    if (!data.site) throw new BadRequestException('site required');
    if (!data.platform) throw new BadRequestException('platform required');
    
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

  async getUserDeletions(userId: string) {
    const deletions = await this.prisma.deletions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    
    return deletions;
  }

  async getStats(userId: string) {
    const deletions = await this.prisma.deletions.findMany({
      where: { user_id: userId },
    });
    
    const total = deletions.length;
    const pending = deletions.filter(d => d.status === 'pending').length;
    const sent = deletions.filter(d => d.status === 'sent').length;
    const resolved = deletions.filter(d => d.status === 'resolved').length;
    
    return { total, pending, sent, resolved };
  }

  async exportToCSV(userId: string) {
    const deletions = await this.prisma.deletions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    
    const csv = [
      'ID,Site,Plateforme,Statut,Date de création,Dernière mise à jour',
      ...deletions.map(d => 
        `${d.id},${d.site},${d.platform},${d.status},${d.created_at.toISOString()},${d.updated_at.toISOString()}`
      )
    ].join('\n');
    
    return csv;
  }

  async request(site: string) {
    if (!site) throw new BadRequestException('site required');
    const rec = await this.prisma.deletions.create({ data: { site } as any });
    return { id: rec.id, status: rec.status };
  }

  async status(id: string) {
    if (!id) throw new BadRequestException('id required');
    const rec = await this.prisma.deletions.findUnique({ where: { id } });
    if (!rec) throw new BadRequestException('not found');
    return rec;
  }
}
