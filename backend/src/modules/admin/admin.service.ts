import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  listUsers() {
    // Supabase Auth users are external; return app-side data
    return this.prisma.identities.findMany();
  }

  listDeletions() {
    return this.prisma.deletions.findMany({ orderBy: { created_at: 'desc' } });
  }

  async exportCsv() {
    const rows = await this.prisma.deletions.findMany();
    const header = 'id,site,status,created_at';
    const body = rows.map(r => `${r.id},${r.site},${r.status},${r.created_at?.toISOString?.() ?? ''}`).join('\n');
    return `${header}\n${body}`;
  }
}
