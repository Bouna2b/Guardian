import { Test } from '@nestjs/testing';
import { MandateService } from './mandate.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

describe('MandateService', () => {
  it('should be defined', async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [MandateService, PrismaService],
    }).compile();
    const service = module.get(MandateService);
    expect(service).toBeDefined();
  });
});
