import { IsEmail, IsString, MinLength, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsDateString()
  dob!: string;

  @IsString()
  country!: string;

  @IsOptional()
  @IsArray()
  pseudos?: Array<{ platform: string; handle: string }>;

  @IsOptional()
  @IsArray()
  keywords?: string[];

  @IsBoolean()
  gdpr_consent!: boolean;

  @IsOptional()
  @IsBoolean()
  newsletter_consent?: boolean;
}
