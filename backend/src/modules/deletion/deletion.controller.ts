import { Body, Controller, Get, Post, Query, UseGuards, Req, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DeletionService } from './deletion.service';
import { Response } from 'express';

@Controller('deletion')
@UseGuards(JwtAuthGuard)
export class DeletionController {
  constructor(private readonly deletionService: DeletionService) {}

  @Post('create')
  createRequest(@Req() req: any, @Body() body: { site: string; platform: string; url?: string }) {
    const userId = req.user?.id;
    return this.deletionService.createRequest(userId, body);
  }

  @Get('list')
  getUserDeletions(@Req() req: any) {
    const userId = req.user?.id;
    return this.deletionService.getUserDeletions(userId);
  }

  @Get('stats')
  getStats(@Req() req: any) {
    const userId = req.user?.id;
    return this.deletionService.getStats(userId);
  }

  @Get('export')
  async exportToCSV(@Req() req: any, @Res() res: Response) {
    const userId = req.user?.id;
    const csv = await this.deletionService.exportToCSV(userId);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=demandes-rgpd.csv');
    res.send(csv);
  }

  @Post('request')
  request(@Body() body: { site: string }) {
    return this.deletionService.request(body.site);
  }

  @Get('status')
  status(@Query('id') id: string) {
    return this.deletionService.status(id);
  }
}
