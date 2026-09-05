import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RidersModule } from './riders/riders.module';

@Module({
  imports: [PrismaModule, DeliveriesModule, AuthModule, UsersModule, RidersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
