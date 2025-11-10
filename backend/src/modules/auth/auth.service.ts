import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private supabase;
  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.get<string>('supabase.url') ?? '',
      this.config.get<string>('supabase.key') ?? '',
    );
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error || !data.session) throw new UnauthorizedException(error?.message ?? 'Invalid credentials');
    return { access_token: data.session.access_token, user: data.user };
  }

  async register(dto: RegisterDto) {
    // Sign up with email confirmation disabled for dev
    const { data, error } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: { 
        emailRedirectTo: undefined,
        data: { 
          role: 'user',
          first_name: dto.first_name,
          last_name: dto.last_name,
          phone: dto.phone,
          dob: dto.dob,
          country: dto.country,
          pseudos: dto.pseudos || [],
          keywords: dto.keywords || [],
          gdpr_consent: dto.gdpr_consent,
          gdpr_consent_date: new Date().toISOString(),
          newsletter_consent: dto.newsletter_consent || false,
        } 
      },
    });
    
    if (error) throw new UnauthorizedException(error?.message ?? 'Registration failed');
    if (!data.user) throw new UnauthorizedException('Registration failed - no user created');
    
    // If no session (email confirmation required), try to sign in immediately
    if (!data.session) {
      const { data: loginData, error: loginError } = await this.supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });
      
      if (loginError || !loginData.session) {
        // Return user but indicate email confirmation needed
        return { 
          user: data.user,
          session: null,
          access_token: null,
          message: 'Please check your email to confirm your account',
        };
      }
      
      return {
        user: loginData.user,
        session: loginData.session,
        access_token: loginData.session.access_token,
      };
    }
    
    // Return user with session if available
    return { 
      user: data.user,
      session: data.session,
      access_token: data.session?.access_token,
    }; 
  }
}
