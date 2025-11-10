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
exports.ScanService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const supabase_js_1 = require("@supabase/supabase-js");
let ScanService = class ScanService {
    constructor(prisma, config) {
        var _a, _b, _c;
        this.prisma = prisma;
        this.config = config;
        this.supabase = (0, supabase_js_1.createClient)((_a = this.config.get('supabase.url')) !== null && _a !== void 0 ? _a : '', (_b = this.config.get('supabase.key')) !== null && _b !== void 0 ? _b : '');
        const serviceRoleKey = this.config.get('supabase.serviceRoleKey');
        if (serviceRoleKey) {
            this.supabaseAdmin = (0, supabase_js_1.createClient)((_c = this.config.get('supabase.url')) !== null && _c !== void 0 ? _c : '', serviceRoleKey);
        }
        else {
            this.supabaseAdmin = this.supabase;
        }
    }
    async startScan(userId) {
        var _a, _b, _c, _d, _e, _f;
        const { data: { user }, error } = await this.supabaseAdmin.auth.admin.getUserById(userId);
        if (error || !user) {
            throw new Error('User not found');
        }
        const firstName = ((_a = user.user_metadata) === null || _a === void 0 ? void 0 : _a.first_name) || '';
        const lastName = ((_b = user.user_metadata) === null || _b === void 0 ? void 0 : _b.last_name) || '';
        const email = user.email || '';
        const pseudos = ((_c = user.user_metadata) === null || _c === void 0 ? void 0 : _c.pseudos) || [];
        const keywords = ((_d = user.user_metadata) === null || _d === void 0 ? void 0 : _d.keywords) || [];
        const exclusions = ((_e = user.user_metadata) === null || _e === void 0 ? void 0 : _e.exclusions) || [];
        const blacklistUrls = ((_f = user.user_metadata) === null || _f === void 0 ? void 0 : _f.blacklist_urls) || [];
        console.log(`🔍 Starting scan for user ${userId}`);
        console.log(`📋 Blacklist contains ${blacklistUrls.length} URL(s)`);
        const verificationTerms = [
            firstName.toLowerCase(),
            lastName.toLowerCase(),
            `${firstName} ${lastName}`.toLowerCase(),
            email.toLowerCase(),
            ...pseudos.map((p) => (typeof p === 'string' ? p : p.handle).toLowerCase()),
        ].filter(term => term.length > 0);
        const searchQueries = [
            `"${firstName} ${lastName}"`,
            ...pseudos.map((p) => `"${typeof p === 'string' ? p : p.handle}"`),
            ...keywords.map((k) => `"${k}"`),
        ];
        const results = [];
        for (const query of searchQueries) {
            try {
                const searchResults = await this.performWebSearch(query, exclusions, verificationTerms, blacklistUrls);
                results.push(...searchResults);
            }
            catch (err) {
                console.error(`Search failed for query: ${query}`, err);
            }
        }
        let savedCount = 0;
        let duplicateCount = 0;
        for (const result of results) {
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
    async performWebSearch(query, exclusions, verificationTerms, blacklistUrls = []) {
        const apiKey = this.config.get('google.apiKey');
        const searchEngineId = this.config.get('google.searchEngineId');
        if (!apiKey || !searchEngineId) {
            console.warn('⚠️  Google API keys not configured. Skipping search for:', query);
            console.warn('Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in your .env file');
            return [];
        }
        try {
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
            const results = data.items.map((item) => ({
                source: new URL(item.link).hostname.replace('www.', ''),
                title: item.title,
                snippet: item.snippet || '',
                url: item.link,
            }));
            return results.filter((result) => {
                const text = `${result.title} ${result.snippet}`.toLowerCase();
                if (blacklistUrls.some(blacklistedUrl => result.url === blacklistedUrl)) {
                    console.log(`🚫 Skipping result (blacklisted URL): ${result.title}`);
                    return false;
                }
                const hasExclusion = exclusions.some((exclusion) => text.includes(exclusion.toLowerCase()));
                if (hasExclusion) {
                    console.log(`⏭️  Skipping result (exclusion found): ${result.title}`);
                    return false;
                }
                const hasVerificationTerm = verificationTerms.some((term) => text.includes(term));
                if (!hasVerificationTerm) {
                    console.log(`⏭️  Skipping result (no matching term): ${result.title}`);
                    return false;
                }
                console.log(`✅ Keeping result: ${result.title}`);
                return true;
            });
        }
        catch (error) {
            console.error('Error performing web search:', error);
            return [];
        }
    }
    async analyzeSentiment(text) {
        const negativeWords = ['problème', 'mauvais', 'arnaque', 'fraude', 'scandale', 'critique'];
        const positiveWords = ['excellent', 'bon', 'super', 'génial', 'recommande', 'professionnel'];
        const lowerText = text.toLowerCase();
        const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;
        const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
        if (negativeCount > positiveCount)
            return 'negative';
        if (positiveCount > negativeCount)
            return 'positive';
        return 'neutral';
    }
    async getHistory(userId) {
        const scans = await this.prisma.scans.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        return scans;
    }
    async deleteMention(id, userId) {
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
    async deleteMultipleMentions(ids, userId, blacklistUrls) {
        var _a;
        if (blacklistUrls && blacklistUrls.length > 0) {
            try {
                const { data: profile, error } = await this.supabase.auth.admin.getUserById(userId);
                if (!error && profile) {
                    const currentBlacklist = ((_a = profile.user_metadata) === null || _a === void 0 ? void 0 : _a.blacklist_urls) || [];
                    const updatedBlacklist = [...new Set([...currentBlacklist, ...blacklistUrls])];
                    await this.supabase.auth.admin.updateUserById(userId, {
                        user_metadata: {
                            ...profile.user_metadata,
                            blacklist_urls: updatedBlacklist,
                        },
                    });
                    console.log(`✅ ${blacklistUrls.length} URL(s) ajoutée(s) à la blacklist pour l'utilisateur ${userId}`);
                }
            }
            catch (error) {
                console.error('Erreur lors de l\'ajout à la blacklist:', error);
            }
        }
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
    async deleteAllMentions(userId) {
        const result = await this.prisma.scans.deleteMany({
            where: { user_id: userId },
        });
        return {
            success: true,
            message: `Toutes les mentions supprimées (${result.count})`,
            count: result.count,
        };
    }
};
exports.ScanService = ScanService;
exports.ScanService = ScanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ScanService);
//# sourceMappingURL=scan.service.js.map