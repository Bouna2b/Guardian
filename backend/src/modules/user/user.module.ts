import { Module } from '@nestjs/common';
import { UserController, DashboardController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [UserController, DashboardController],
  providers: [UserService],
})
export class UserModule {}
