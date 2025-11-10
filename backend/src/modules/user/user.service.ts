import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  private supabase;
  private supabaseAdmin;
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    this.supabase = createClient(
      this.config.get<string>('supabase.url') ?? '',
      this.config.get<string>('supabase.key') ?? '',
    );
    
    // Admin client with service role key for admin operations
    const serviceRoleKey = this.config.get<string>('supabase.serviceRoleKey');
    if (serviceRoleKey) {
      this.supabaseAdmin = createClient(
        this.config.get<string>('supabase.url') ?? '',
        serviceRoleKey,
      );
    } else {
      // Fallback to regular client if service role key not available
      console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will use regular client.');
      this.supabaseAdmin = this.supabase;
    }
  }

  getProfile(user: any) {
    return {
      id: user?.id,
      email: user?.email,
      first_name: user?.user_metadata?.first_name || user?.app_metadata?.first_name,
      last_name: user?.user_metadata?.last_name || user?.app_metadata?.last_name,
      phone: user?.user_metadata?.phone,
      country: user?.user_metadata?.country,
      user_metadata: user?.user_metadata,
    };
  }

  async updateProfile(userId: string, data: any) {
    // Update user metadata in Supabase Auth using admin client
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

  async getDashboardData(userId: string) {
    // Get real data from database
    const scans = await this.prisma.scans.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    const deletions = await this.prisma.deletions.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    // Get user identity/KYC status
    const identity = await this.prisma.identities.findFirst({
      where: { user_id: userId },
    });

    // Calculate real metrics
    const totalMentions = scans.length;
    const positiveMentions = scans.filter((s) => s.sentiment === 'positive').length;
    const negativeMentions = scans.filter((s) => s.sentiment === 'negative').length;
    const neutralMentions = scans.filter((s) => s.sentiment === 'neutral').length;
    const pendingDeletions = deletions.filter((d) => d.status === 'pending').length;
    const completedDeletions = deletions.filter((d) => d.status === 'completed').length;

    // Calculate Guardian Score based on real data
    let guardianScore = 50; // Base score
    if (totalMentions > 0) {
      const positiveRatio = positiveMentions / totalMentions;
      const negativeRatio = negativeMentions / totalMentions;
      guardianScore = Math.round(50 + (positiveRatio * 30) - (negativeRatio * 30) + (completedDeletions * 2));
      guardianScore = Math.max(0, Math.min(100, guardianScore)); // Clamp between 0-100
    }

    // Count alerts (negative mentions from last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAlerts = scans.filter(
      (s) => s.sentiment === 'negative' && s.created_at && s.created_at >= sevenDaysAgo
    ).length;

    return {
      guardianScore,
      mentionsCount: totalMentions,
      deletionsCount: pendingDeletions,
      positiveMentions,
      negativeMentions,
      neutralMentions,
      alerts: recentAlerts,
      mentions: scans.slice(0, 10).map((s) => ({
        id: s.id,
        source: s.source || 'Web',
        title: s.title || `Mention trouvée`,
        snippet: s.content || '',
        sentiment: s.sentiment || 'neutral',
        url: s.url || '',
        date: s.created_at?.toISOString() || new Date().toISOString(),
      })),
      deletions: deletions.slice(0, 5).map((d) => ({
        id: d.id,
        platform: d.platform || 'Unknown',
        status: d.status,
        created_at: d.created_at?.toISOString(),
        updated_at: d.updated_at?.toISOString(),
      })),
      accountStatus: {
        kyc_status: identity?.verified ? 'verified' : 'pending',
        mandate_signed: !!identity,
        alerts_enabled: true,
      },
    };
  }

  async uploadId(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File required');
    const bucket = 'identities';
    const filename = `${randomUUID()}-${file.originalname}`;
    const { data, error } = await this.supabase.storage.from(bucket).upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throw new BadRequestException(error.message);

    const publicUrl = this.supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;

    await this.prisma.identities.create({ data: { document_url: publicUrl } });
    return { url: publicUrl };
  }
}
