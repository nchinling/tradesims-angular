import { Component, EventEmitter, Injectable, Input, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginResponse, RegisterResponse, Stock, StockProfile, StockInfo } from '../models';
import { AccountService } from '../services/account.service';
import { StockService } from '../services/stock.service';
import { DashboardComponent } from './dashboard.component';


@Component({
  selector: 'app-research',
  templateUrl: './research.component.html',
  styleUrls: ['./research.component.css']
})
export class ResearchComponent  {
  stockSvc = inject(StockService)
  accountSvc = inject(AccountService)
  activatedRoute = inject(ActivatedRoute)
  fb = inject(FormBuilder)

  loginResponse$!: Observable<LoginResponse>
  registerResponse$!: Observable<RegisterResponse>
  errorMessage$!: Observable<string>
  username!: string
  status!: string
  timestamp!: string
  accountId!: string

  
  //stock variables
  stock$!: Promise<Stock>
  stockProfile$!: Promise<StockProfile>
  symbol$!: Observable<string>
  

  // //for watchlist
  symbol!:string
  stock_name!: string
  // watchlist: string[] = []
  // isFollowed!:boolean 
  // isButtonClicked:boolean = false;

  updatedChartData = new EventEmitter<{ symbol: string, stock_name: string }>();

  //for companies list
  @Input()
  limit = 10

  @Input()
  skip = 0

  @Input()
  filter = ""

  @Input()
  exchange = "nyse"

  stockInfoList$!: Promise<StockInfo[]>
 
  stockDataForm!: FormGroup
  loadStock: string = 'AAPL'
  loadInterval: string = '1min'

  //for chart
  initialChartSymbol!:string
  

  ngOnInit(): void {
    // this.loginResponse$ = this.accountSvc.onLoginRequest
    this.registerResponse$ = this.accountSvc.onRegisterRequest
    this.loginResponse$ = this.accountSvc.onLoginRequest
    this.errorMessage$ = this.accountSvc.onErrorMessage

        const queryParams = this.activatedRoute.snapshot.queryParams;
        
        this.status = queryParams['status'];
        this.timestamp = queryParams['timestamp'];
        this.accountId = queryParams['account_id'];
        this.username = queryParams['username'];

        console.log('Status:', this.status);
        console.log('Timestamp:', this.timestamp);
        console.log('Account ID:', this.accountId);
        console.log('Username:', this.username);

        if(localStorage.getItem('username')){
          this.username = this.accountSvc.username
          this.accountId = this.accountSvc.account_id
        } else{
        }


      this.stockDataForm = this.createStockDataForm()
      this.stockInfoList$ = this.stockSvc.getStocksList(this.exchange, this.filter, this.limit, this.skip)
      
      this.loadStock = this.stockSvc.symbol
      this.initialChartSymbol = 'AAPL'

      const symbolToLoad = (this.loadStock !== '') ? this.loadStock : 'AAPL';
      console.log('The symbol in research comp is ' + this.loadStock)
      console.log('The symbolToLoad is ' + symbolToLoad)
      this.stock$ = this.stockSvc.getStockData(symbolToLoad, '1min');
      this.stockProfile$ = this.stockSvc.getStockProfile(symbolToLoad); 
      this.stockProfile$.then(profile => {
        const name = profile.name
        console.log('The name is ' + name)
        this.stock_name = name
        this.updatedChartData.emit({ symbol: symbolToLoad, stock_name: this.stock_name });
      });

  }

  getStockData(symbol?: string) {
    let interval = '1min'

    if (!symbol) {
      symbol = this.stockDataForm.get('symbol')?.value;
      // interval = this.stockDataForm.get('interval')?.value
    }
  
    if (symbol && interval) {
      console.info('>> symbol: ', symbol)
      console.info('>> interval: ', interval)
      this.stock$ = this.stockSvc.getStockData(symbol, interval)
      this.stockProfile$ = this.stockSvc.getStockProfile(symbol)
      this.stockProfile$.then(profile => {
        const name = profile.name;
        console.log('The name is ' + name);
        this.stock_name = name
        this.updatedChartData.emit({ symbol: this.symbol, stock_name: this.stock_name });
      });
      this.symbol = symbol
    }
  }

  private createStockDataForm(): FormGroup {
    return this.fb.group({
      symbol: this.fb.control<string>('', [ Validators.required ]),
      // interval: this.fb.control<string>(this.loadInterval, [ Validators.required ])
    })
  }


  //for displaying stocks list
  fetchChanges(limit: string) {
    this.limit = +limit
    this.stockInfoList$= this.stockSvc.getStocksList(this.exchange, this.filter, this.limit, this.skip)
  }

  fetchExchange(exchange: string) {
    this.exchange = exchange
    this.stockInfoList$= this.stockSvc.getStocksList(this.exchange, this.filter, this.limit, this.skip)
  }

  filtering(text: string) {
    this.filter = text
    this.stockInfoList$= this.stockSvc.getStocksList(this.exchange, this.filter, this.limit, this.skip)
  }

  page(d: number) {
    if (d >= 0)
      this.skip += this.limit
    else
      this.skip = Math.max(0, this.skip - this.limit)

    this.stockInfoList$ = this.stockSvc.getStocksList(this.exchange, this.filter, this.limit, this.skip)
  }

  hasPreviousPage(): boolean {
    return this.skip >= this.limit;
  }
  

}

