// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Role } from './entities/role.entity';
import { TwilioModule } from 'src/twilio/twilio.module';

@Module({
  imports: [TypeOrmModule.forFeature([User,Role]),TwilioModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // ✅ export so AuthModule can use it
})
export class UsersModule {}