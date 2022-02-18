import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

// import { stocks } from '../data/snp500.json';
// import { stocks } from '../data/stoxx600.json';
import { stocks } from '../data/hsi.json';
// import { stocks } from '../data/nikkei.json';

import { appendFile } from 'fs';

interface IStock {
  name: string;
  ticker: string;
  sharesOutstanding: number;
  sharePrice: number;
  netIncome: number;
  earningsYield: number;
  '10year': number;
}

@Injectable()
export class StockService {
  async getStocks(): Promise<string> {
    const stocksData: IStock[] = stocks as IStock[];

    try {
      for await (const stock of stocksData) {
        const url = `https://finance.yahoo.com/quote/${stock.ticker}/key-statistics?p=${stock.ticker}`;

        console.log(url);

        const result = await fetch(url);
        const page = await result.text();
        const root = parse(page);

        const netIncomSelector =
          '#Col1-0-KeyStatistics-Proxy>section>div:nth-of-type(2)>div:nth-of-type(3)>div>div:nth-of-type(4)>div>div>table tr:nth-of-type(6)>td:nth-of-type(2)';
        const netIncomeStr =
          root.querySelector(netIncomSelector)?.innerHTML ?? '0';
        const netIncome = this.parseTextNumber(netIncomeStr);

        const sharesOutstandingSelector =
          '#Col1-0-KeyStatistics-Proxy>section>div:nth-of-type(2)>div:nth-of-type(2)>div>div:nth-of-type(2) tbody>tr:nth-of-type(3)>td:nth-of-type(2)';
        const sharesOutstandingStr =
          root.querySelector(sharesOutstandingSelector)?.innerHTML ?? '0';
        const sharesOutstanding = this.parseTextNumber(sharesOutstandingStr);

        const sharePriceSelector =
          'fin-streamer.Fw\\(b\\).Fz\\(36px\\).Mb\\(-4px\\).D\\(ib\\)';
        const sharePriceStr =
          root.querySelector(sharePriceSelector)?.innerHTML ?? '0';
        const sharePrice = this.parseTextNumber(sharePriceStr);

        const earningsYield = 1 + netIncome / sharesOutstanding / sharePrice;

        stock['sharePrice'] = sharePrice;
        stock['sharesOutstanding'] = sharesOutstanding;
        stock['netIncome'] = netIncome;
        stock['earningsYield'] = earningsYield;
        stock['10year'] = sharePrice * earningsYield ** 10;

        console.log(stock);

        const file =
          '/Users/iurii_malakhovskyi/Documents/Personal/projects/stock/data/tmp.json';
        appendFile(file, `${JSON.stringify(stock)},`, function (err) {
          if (err) throw err;
          console.log('Saved!');
        });

        await this.delay(5);
      }

      stocksData.sort((stockA, stockB) => {
        return stockB.earningsYield - stockA.earningsYield;
      });
    } catch (error) {
      console.error(error);
    }

    return JSON.stringify(stocksData);
  }

  private parseTextNumber(textNumber: string): number {
    const scales = {
      M: 10 ** 6,
      B: 10 ** 9,
      T: 10 ** 12,
    };
    const scale = textNumber.slice(-1);

    if (!scales[scale]) {
      return parseFloat(textNumber.replace(',', ''));
    }

    const number = parseFloat(textNumber.slice(0, -1));

    return number * scales[scale];
  }

  private async delay(number: number): Promise<void> {
    return new Promise<void>((res) => {
      setTimeout(() => {
        res();
      }, number * 1000);
    });
  }

  private async collectData(): Promise<string> {
    const snp500Url = 'https://www.slickcharts.com/sp500';

    const snp500Response = await fetch(snp500Url);
    const snp500Html = await snp500Response.text();
    const root = parse(snp500Html);

    const tickers = root
      .querySelectorAll('tbody>tr>td:nth-child(3)>a')
      .map((htmlElement) => {
        return htmlElement.innerHTML;
      });

    return JSON.stringify(tickers);
  }
}
