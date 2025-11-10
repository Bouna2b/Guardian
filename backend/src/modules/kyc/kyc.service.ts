import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class KycService {
  private supabase;
  private supabaseAdmin;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Client normal
    this.supabase = createClient(
      this.config.get<string>('supabase.url') ?? '',
      this.config.get<string>('supabase.key') ?? '',
    );
    
    // Client admin avec service role key pour bypasser RLS
    const serviceRoleKey = this.config.get<string>('supabase.serviceRoleKey');
    if (serviceRoleKey) {
      this.supabaseAdmin = createClient(
        this.config.get<string>('supabase.url') ?? '',
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    } else {
      console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not configured, using anon key');
      this.supabaseAdmin = this.supabase;
    }
  }

  async getStatus(userId: string) {
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

  async getUploadUrl(userId: string, filename: string, contentType: string) {
    const bucket = 'kyc-documents';
    const filePath = `${userId}/${Date.now()}-${filename}`;

    try {
      // Utiliser le client admin pour bypasser RLS
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
    } catch (error) {
      console.error('Error in getUploadUrl:', error);
      throw error;
    }
  }

  async submitKyc(userId: string, fileRefs: any) {
    // Store KYC submission in identities table
    await this.prisma.identities.create({
      data: {
        user_id: userId,
        document_url: JSON.stringify(fileRefs),
        verified: false,
      } as any,
    });

    return {
      kyc_status: 'pending',
      message: 'Documents soumis pour vérification',
    };
  }

  async handleWebhook(body: any) {
    const { user_id, status } = body;

    // Update KYC status
    await this.prisma.identities.updateMany({
      where: { user_id },
      data: { verified: status === 'verified' } as any,
    });

    return { received: true };
  }
}
