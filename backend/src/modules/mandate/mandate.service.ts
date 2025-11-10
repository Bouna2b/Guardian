import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MandateService {
  private supabase;
  private supabaseAdmin;
  
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {
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

  async create(userId: string) {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    return await new Promise(async (resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const filename = `mandates/mandate-${Date.now()}.pdf`;
          
          // Utiliser le client admin pour bypasser RLS
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
          await this.prisma.mandates.create({ data: { user_id: userId, pdf_url: url, signed: false } as any });
          resolve({ pdf_url: url });
        } catch (error) {
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

  async sign(userId: string) {
    await this.prisma.mandates.updateMany({
      where: { user_id: userId },
      data: { signed: true } as any,
    });
    return { signed: true, message: 'Mandat signé avec succès' };
  }
}
