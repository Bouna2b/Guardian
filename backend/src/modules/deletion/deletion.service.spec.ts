import { Test } from '@nestjs/testing';
import { DeletionService } from './deletion.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DeletionService', () => {
  it('should be defined', async () => {
    const module = await Test.createTestingModule({
      providers: [DeletionService, PrismaService],
    }).compile();
    const service = module.get(DeletionService);
    expect(service).toBeDefined();
  });
});
