import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/guards/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { Response } from 'express';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  users() {
    return this.adminService.listUsers();
  }

  @Get('deletions')
  deletions() {
    return this.adminService.listDeletions();
  }

  @Get('export')
  async exportCsv(@Res() res: Response) {
    const csv = await this.adminService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }
}
