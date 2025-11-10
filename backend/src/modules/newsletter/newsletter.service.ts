import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NewsletterService {
  constructor(private readonly config: ConfigService) {}

  async subscribe(email: string) {
    if (!email) throw new BadRequestException('email required');
    const apiKey = this.config.get<string>('brevo.apiKey');
    await axios.post('https://api.brevo.com/v3/contacts', { email }, {
      headers: { 'api-key': apiKey, 'content-type': 'application/json' },
    }).catch(() => {});
    return { subscribed: true };
  }
}
