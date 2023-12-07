import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LidlController } from './api/lidl.controller';

@Module({
  imports: [],
  controllers: [AppController, LidlController],
  providers: [AppService],
})
export class AppModule {}
