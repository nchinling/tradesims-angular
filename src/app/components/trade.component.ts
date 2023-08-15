import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, switchMap, from, firstValueFrom } from 'rxjs';
import { StockInfo, PortfolioData, TradeResponse, Stock, TradeData, LoginResponse } from '../models';
import { AccountService } from '../services/account.service';
import { StockService } from '../services/stock.service';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush 
})
export class TradeComponent {

  // register$!: Promise<RegisterResponse>
  stockInfoList$!: Promise<StockInfo[]>
  portfolioSymbols$!:Promise<string[]>
  portfolioData$!:Promise<PortfolioData[]>
  loginResponse$!: Observable<LoginResponse>


  tradeResponse$!: Promise<TradeResponse>
  stockSearch$!: Observable<StockInfo[]>
  stock$!: Promise<Stock>
  symbol!: string
  
  // currency!: string

  tradeForm!: FormGroup
  errorMessage!: string;
  username!: string
  parsedUsername!: string
  accountId!: string
 
  filter!:string
  portfolioList!: string[]

  searchInput = new Subject<string>
 
  fb = inject(FormBuilder)
  router = inject(Router)
  accountSvc = inject(AccountService)
  stockSvc = inject(StockService)
  // modalSvc = inject(NgbModal)
  // constructor(private modalService: NgbModal) {}
  errorMessage$!: Observable<string>

  @Input()
  exchange = "nyse"

  @Input() stockName!: string;
  @Input() closePrice!: number;
  @Input() livePrice!: number;
  @Input() stockSymbol!: string;
  @Input() stockExchange!: string;
  @Input() currency!: string;

  ngOnInit(): void {
    this.accountId = this.accountSvc.account_id
    this.username = this.accountSvc.username
    this.tradeForm = this.createForm()
    this.errorMessage$ = this.accountSvc.onErrorMessage;

    this.loginResponse$ = this.accountSvc.onLoginRequest

    //to display all trades
    // this.portfolioSymbols$ = this.stockSvc.getPortfolioSymbols(this.accountId)
    // console.info('this.symbols$ is' + this.portfolioSymbols$)

    // this.portfolioSymbols$.then((symbol: string[]) => {
    //   console.info('Symbols:', symbol);
    //   this.portfolioData$ = this.stockSvc.getPortfolioData(symbol, this.accountId);
    // }).catch((error) => {
    //   console.error(error);
    // });

    
    this.stockSearch$ = this.searchInput.pipe(
      switchMap((text: string) => {
        return from(this.stockSvc.getStocksList(this.exchange, text, 5, 0));
      })
    );
  }

  private createForm(): FormGroup {
    return this.fb.group({
      units: this.fb.control<number>(0, [ Validators.required, Validators.min(1)]),

    })
  }

  canExit(): boolean {
    return !this.tradeForm.dirty
  }


  invalidField(ctrlName:string): boolean{
    return !!(this.tradeForm.get(ctrlName)?.invalid && 
          this.tradeForm.get(ctrlName)?.dirty)
  }

  processTrade() {
    console.log('I have submitted the form')
    // this.modalSvc.dismissAll();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const datePipe = new DatePipe('en-US');
    const formattedDate = datePipe.transform(today, 'yyyy-MM-dd');
    
    const tradeData: TradeData = {
      symbol: this.stockSymbol,
      currency: this.currency,
      units: this.tradeForm.value.units,
      exchange: this.stockExchange,
      date: today,
      stockName: this.stockName,
      price: this.closePrice,
      fee: 0,
      accountId: this.accountId,
      username: this.username
    };
    

    console.info('trade data: ', tradeData)
    this.tradeForm = this.createForm()

    //Using promise
    this.tradeResponse$=firstValueFrom(this.accountSvc.saveToPortfolio(tradeData))
    this.tradeResponse$.then((response) => {
      console.log('exchange:', response.exchange);
      console.log('stockName:', response.stockName);
      console.log('symbol:', response.symbol);
      console.log('units:', response.units);
      console.log('price:', response.price);
      // console.log('units:', response.fee);
   

      //refer to researchComp
      this.portfolioSymbols$ = this.stockSvc.getPortfolioSymbols(this.accountId)
      console.info('this.symbols$ is' + this.portfolioSymbols$)
      this.portfolioSymbols$.then((symbol: string[]) => {
        console.info('Symbols:', symbol);
        this.portfolioData$ = this.stockSvc.getPortfolioData(symbol, this.accountId);
      }).catch((error) => {
        console.error(error);
      });

    }).catch((error)=>{
  
      this.errorMessage = error.error;
      console.info('this.errorMessage is ' + this.errorMessage)

    });
    this.router.navigate(['/dashboard'])


  }

  filtering(text:string){
    this.searchInput.next(text as string)
  }


  fetchExchange(exchange: string) {
    this.exchange = exchange
    this.stockInfoList$= this.stockSvc.getStocksList(this.exchange, '', 5, 0)
  }

  getStockData(symbol: string) {
    let interval = '1min'
    this.symbol = symbol


    if (symbol && interval) {
      console.info('>> symbol: ', symbol);
      console.info('>> interval: ', interval);
      this.stock$ = this.stockSvc.getStockData(symbol, interval)
 
      this.stockSvc.getStockData(symbol, interval)
        .then(stockData => {
          this.currency = stockData.currency
          this.patchNameField(`${stockData.name} (${stockData.symbol})`);
        });
    }
  
    this.stockSearch$ = this.searchInput.pipe(
      switchMap((text: string) => {
        return from(this.stockSvc.getStocksList(this.exchange, text, 5, 0));
      })
    );

  }


  private patchNameField(value: string) {
    this.tradeForm.patchValue({ stockName:value });
  }

  calculateTotalReturn(portfolioData: any[]): number {
    return portfolioData.reduce((total, data) => total + data.total_return, 0);
  }

  calculateTotalPercentageReturn(portfolioData: any[]): number {
    const totalReturn = this.calculateTotalReturn(portfolioData);
    const totalInvestment = portfolioData.reduce((total, data) => total + data.buy_total_price, 0);
    return (totalReturn / totalInvestment) * 100;
  }

  
  removeFromCumulativePortfolio(index: number) {
    const symbolToRemove: string = this.stockSvc.portfolioSymbols[index];
    console.info('To remove symbol: ' + symbolToRemove);
  
    this.stockSvc.removeFromPortfolio(index, this.accountId)
      .then(() => {
        console.info('Symbol removed successfully');
        return this.stockSvc.getPortfolioSymbols(this.accountId);
      })
      .then((symbol: string[]) => {
        console.info('The updated list of Symbols after removal are:', symbol);
        this.portfolioSymbols$ = Promise.resolve(symbol);
        return this.stockSvc.getPortfolioData(symbol, this.accountId);
      })
      .then((allPortfolioData: PortfolioData[]) => {
        this.portfolioData$ = Promise.resolve(allPortfolioData);
      })
      .catch((error) => {
        console.error(error);
      });
     
  }



}

