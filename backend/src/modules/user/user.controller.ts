import { Controller, Get, Post, Put, Body, UseGuards, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  profile(@Req() req: any) {
    return this.userService.getProfile(req.user);
  }

  @Put('profile')
  updateProfile(@Req() req: any, @Body() body: any) {
    return this.userService.updateProfile(req.user?.id, body);
  }

  @Post('upload-id')
  @UseInterceptors(FileInterceptor('file'))
  uploadId(@UploadedFile() file: Express.Multer.File) {
    return this.userService.uploadId(file);
  }
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getDashboard(@Req() req: any) {
    return this.userService.getDashboardData(req.user?.id);
  }
}
