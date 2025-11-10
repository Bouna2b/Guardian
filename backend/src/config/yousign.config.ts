import { registerAs } from '@nestjs/config';

export default registerAs('yousign', () => ({
  apiKey: process.env.YOUSIGN_API_KEY ?? '',
}));
