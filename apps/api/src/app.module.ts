import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, DeliveriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
