import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [],
  controllers: [AppController, StockController],
  providers: [AppService, StockService],
})
export class AppModule {}
