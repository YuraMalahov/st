import { Controller, Get, Header } from '@nestjs/common';
import { StockService } from './stock.service';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  async getStocks(): Promise<string> {
    return this.stockService.getStocks();
  }
}
