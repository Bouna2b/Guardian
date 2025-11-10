import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class ScanService {
  private supabase;
  private supabaseAdmin;
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.supabase = createClient(
      this.config.get<string>('supabase.url') ?? '',
      this.config.get<string>('supabase.key') ?? '',
    );
    
    // Admin client for getUserById
    const serviceRoleKey = this.config.get<string>('supabase.serviceRoleKey');
    if (serviceRoleKey) {
      this.supabaseAdmin = createClient(
        this.config.get<string>('supabase.url') ?? '',
        serviceRoleKey,
      );
    } else {
      this.supabaseAdmin = this.supabase;
    }
  }

  async startScan(userId: string) {
    // Get user profile and keywords from Supabase Auth
    const { data: { user }, error } = await this.supabaseAdmin.auth.admin.getUserById(userId);
    
    if (error || !user) {
      throw new Error('User not found');
    }

    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const email = user.email || '';
    const pseudos = user.user_metadata?.pseudos || [];
    const keywords = user.user_metadata?.keywords || [];
    const exclusions = user.user_metadata?.exclusions || [];
    const blacklistUrls = user.user_metadata?.blacklist_urls || [];

    console.log(`🔍 Starting scan for user ${userId}`);
    console.log(`📋 Blacklist contains ${blacklistUrls.length} URL(s)`);

    // Build list of terms to verify in results
    const verificationTerms = [
      firstName.toLowerCase(),
      lastName.toLowerCase(),
      `${firstName} ${lastName}`.toLowerCase(),
      email.toLowerCase(),
      ...pseudos.map((p: any) => (typeof p === 'string' ? p : p.handle).toLowerCase()),
    ].filter(term => term.length > 0);

    // Build search queries
    const searchQueries = [
      `"${firstName} ${lastName}"`,
      ...pseudos.map((p: any) => `"${typeof p === 'string' ? p : p.handle}"`),
      ...keywords.map((k: string) => `"${k}"`),
    ];

    const results = [];

    // Perform searches using Google Custom Search API or web scraping
    for (const query of searchQueries) {
      try {
        const searchResults = await this.performWebSearch(query, exclusions, verificationTerms, blacklistUrls);
        results.push(...searchResults);
      } catch (err) {
        console.error(`Search failed for query: ${query}`, err);
      }
    }

    // Save results to database (éviter les doublons par URL)
    let savedCount = 0;
    let duplicateCount = 0;
    
    for (const result of results) {
      // Vérifier si cette URL existe déjà pour cet utilisateur
      const existing = await this.prisma.scans.findFirst({
        where: {
          user_id: userId,
          url: result.url,
        },
      });

      if (existing) {
        duplicateCount++;
        console.log(`⏭️  Skipping duplicate URL: ${result.url}`);
        continue;
      }

      await this.prisma.scans.create({
        data: {
          user_id: userId,
          source: result.source,
          title: result.title,
          content: result.snippet,
          url: result.url,
          sentiment: await this.analyzeSentiment(result.snippet),
        },
      });
      savedCount++;
    }

    console.log(`✅ Saved ${savedCount} new mentions, skipped ${duplicateCount} duplicates`);

    return {
      status: 'completed',
      message: `Scan completed. Found ${results.length} mentions.`,
      mentionsFound: results.length,
    };
  }

  private async performWebSearch(query: string, exclusions: string[], verificationTerms: string[], blacklistUrls: string[] = []): Promise<any[]> {
    const apiKey = this.config.get<string>('google.apiKey');
    const searchEngineId = this.config.get<string>('google.searchEngineId');

    // If API keys are not configured, return empty results
    if (!apiKey || !searchEngineId) {
      console.warn('⚠️  Google API keys not configured. Skipping search for:', query);
      console.warn('Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in your .env file');
      return [];
    }

    try {
      // Call Google Custom Search API
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('❌ Google API error:', response.status, response.statusText);
        console.error('Error details:', errorBody);
        console.error('Query was:', query);
        return [];
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return [];
      }

      // Transform Google results to our format
      const results = data.items.map((item: any) => ({
        source: new URL(item.link).hostname.replace('www.', ''),
        title: item.title,
        snippet: item.snippet || '',
        url: item.link,
      }));

      // Filter results: must contain at least one verification term AND not contain exclusions AND not be blacklisted
      return results.filter((result) => {
        const text = `${result.title} ${result.snippet}`.toLowerCase();
        
        // Check if URL is blacklisted
        if (blacklistUrls.some(blacklistedUrl => result.url === blacklistedUrl)) {
          console.log(`🚫 Skipping result (blacklisted URL): ${result.title}`);
          return false;
        }
        
        // Check if any exclusion keyword is present
        const hasExclusion = exclusions.some((exclusion) => 
          text.includes(exclusion.toLowerCase())
        );
        
        if (hasExclusion) {
          console.log(`⏭️  Skipping result (exclusion found): ${result.title}`);
          return false;
        }
        
        // Check if at least one verification term is present
        const hasVerificationTerm = verificationTerms.some((term) => 
          text.includes(term)
        );
        
        if (!hasVerificationTerm) {
          console.log(`⏭️  Skipping result (no matching term): ${result.title}`);
          return false;
        }
        
        console.log(`✅ Keeping result: ${result.title}`);
        return true;
      });
    } catch (error) {
      console.error('Error performing web search:', error);
      return [];
    }
  }

  private async analyzeSentiment(text: string): Promise<string> {
    // Simple sentiment analysis based on keywords
    const negativeWords = ['problème', 'mauvais', 'arnaque', 'fraude', 'scandale', 'critique'];
    const positiveWords = ['excellent', 'bon', 'super', 'génial', 'recommande', 'professionnel'];
    
    const lowerText = text.toLowerCase();
    const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;
    const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;

    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  }

  async getHistory(userId: string) {
    const scans = await this.prisma.scans.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return scans;
  }

  async deleteMention(id: string, userId: string) {
    // Verify the mention belongs to the user
    const mention = await this.prisma.scans.findFirst({
      where: { id, user_id: userId },
    });

    if (!mention) {
      throw new Error('Mention not found or unauthorized');
    }

    await this.prisma.scans.delete({
      where: { id },
    });

    return { success: true, message: 'Mention supprimée' };
  }

  async deleteMultipleMentions(ids: string[], userId: string, blacklistUrls?: string[]) {
    // Si des URLs doivent être blacklistées, les ajouter au profil utilisateur
    if (blacklistUrls && blacklistUrls.length > 0) {
      try {
        // Récupérer le profil utilisateur
        const { data: profile, error } = await this.supabase.auth.admin.getUserById(userId);
        
        if (!error && profile) {
          const currentBlacklist = profile.user_metadata?.blacklist_urls || [];
          const updatedBlacklist = [...new Set([...currentBlacklist, ...blacklistUrls])];
          
          // Mettre à jour le profil avec la blacklist
          await this.supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...profile.user_metadata,
              blacklist_urls: updatedBlacklist,
            },
          });
          
          console.log(`✅ ${blacklistUrls.length} URL(s) ajoutée(s) à la blacklist pour l'utilisateur ${userId}`);
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout à la blacklist:', error);
      }
    }
    
    // Delete only mentions that belong to the user
    const result = await this.prisma.scans.deleteMany({
      where: {
        id: { in: ids },
        user_id: userId,
      },
    });

    return {
      success: true,
      message: `${result.count} mention(s) supprimée(s)${blacklistUrls && blacklistUrls.length > 0 ? ' et blacklistée(s)' : ''}`,
      count: result.count,
    };
  }

  async deleteAllMentions(userId: string) {
    const result = await this.prisma.scans.deleteMany({
      where: { user_id: userId },
    });

    return {
      success: true,
      message: `Toutes les mentions supprimées (${result.count})`,
      count: result.count,
    };
  }
}
