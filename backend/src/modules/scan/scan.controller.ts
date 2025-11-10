import { Controller, Get, Post, Delete, UseGuards, Body, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScanService } from './scan.service';

@Controller('scan')
@UseGuards(JwtAuthGuard)
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post('start')
  start(@Req() req: any) {
    const userId = req.user?.id;
    return this.scanService.startScan(userId);
  }

  @Get('history')
  history(@Req() req: any) {
    const userId = req.user?.id;
    return this.scanService.getHistory(userId);
  }

  @Delete(':id')
  deleteMention(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.scanService.deleteMention(id, userId);
  }

  @Post('delete-multiple')
  deleteMultiple(@Body() body: { ids: string[]; blacklistUrls?: string[] }, @Req() req: any) {
    const userId = req.user?.id;
    return this.scanService.deleteMultipleMentions(body.ids, userId, body.blacklistUrls);
  }

  @Delete('all')
  deleteAll(@Req() req: any) {
    const userId = req.user?.id;
    return this.scanService.deleteAllMentions(userId);
  }
}
