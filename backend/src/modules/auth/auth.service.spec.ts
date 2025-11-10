import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';

describe('AuthService', () => {
  it('should be defined', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [AuthService],
    }).compile();
    const service = module.get(AuthService);
    expect(service).toBeDefined();
  });
});
