import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnChanges, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { LoginResponse, PortfolioData, RegisterResponse, TradeResponse } from '../models';
import { AccountService } from '../services/account.service';
import { StockService } from '../services/stock.service';

@Component({
selector: 'app-dashboard', 
templateUrl: './dashboard.component.html',
styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit{

  stockSvc = inject(StockService)
  accountSvc = inject(AccountService)
  activatedRoute = inject(ActivatedRoute)
  cdr = inject(ChangeDetectorRef)
  router = inject(Router)
  title = inject(Title)
  http=inject(HttpClient)

  public notifications = 0;


  loginResponse$!: Observable<LoginResponse>
  registerResponse$!: Observable<RegisterResponse>
  tradeResponse$!: Observable<TradeResponse>
  errorMessage$!: Observable<string>
  username!: string
  cash!: number
  cashBalance!: number
  status!: string
  timestamp!: string
  accountId!: string
  key!: string

  //for watchlist
  stockSymbol$!: Observable<string>
  symbols$!:Promise<string[]>
  symbols!:string[]
  symbol!:string

  portfolioSymbols$!:Promise<string[]>
  portfolioData$!:Promise<PortfolioData[]>
  allTradesData$!:Observable<TradeResponse[]>
  loginSubscription$!:Subscription
  loginResponse!: LoginResponse; 
  netTotal!: number
  netPercentageReturn!: number
  initialCash=1000000


  onStockRequest = new Subject<string>()

  showText = false;
  showAllRowsToggle!:boolean
  text = 'Dashboard';



 ngOnInit():void{

  this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
    this.showText = true;
    setTimeout(() => {
      this.showText = false;
    }, 4000); // Duration of the text animation in milliseconds
  });

  this.showAllRowsToggle=false;


  this.loginSubscription$ = this.accountSvc.onLoginRequest.subscribe((response: LoginResponse) => {
    // Handle the emitted response here
    this.loginResponse = response;

    console.log('this.loginResponseCash is:', this.loginResponse.cash);
    console.log('Received login response2:', response);
   
  });
  
    
    this.registerResponse$ = this.accountSvc.onRegisterRequest
    this.errorMessage$ = this.accountSvc.onErrorMessage
    this.tradeResponse$ = this.accountSvc.onSavePortfolioRequest
    this.loginResponse$ = this.accountSvc.onLoginRequest

    // this.accountSvc.onLoginRequest.subscribe(response => {
    //   this.loginResponse = response; 
    // });


        const queryParams = this.activatedRoute.snapshot.queryParams;
        
        this.status = queryParams['status'];
        this.timestamp = queryParams['timestamp'];
        // this.accountId = queryParams['account_id'];
        // this.username = queryParams['username'];

        this.accountId = this.accountSvc.account_id;
        this.username = this.accountSvc.username;
        this.cash = this.accountSvc.cash;


        
     
        // to display total returns
        this.portfolioSymbols$ = this.stockSvc.getPortfolioSymbols(this.accountId)
        console.info('this.symbols$ is' + this.portfolioSymbols$)
        this.portfolioSymbols$.then((symbol: string[]) => {
          console.info('Symbols:', symbol);
          this.portfolioData$ = this.stockSvc.getPortfolioData(symbol, this.accountId);

          this.portfolioData$.then((data: PortfolioData[]) => {
            let total_current_price = 0;
        
            for (const item of data) {
              total_current_price += item.total_current_price;
            }
            this.netTotal = (this.loginResponse ? this.loginResponse.cash : this.cash)+total_current_price;
            
            this.cashBalance = this.loginResponse ? this.loginResponse.cash : this.accountSvc.cash

            this.netPercentageReturn = ((this.netTotal - this.initialCash)/this.initialCash)*100
            console.info("this.netPercentageReturn is ", this.netPercentageReturn)
          })
  

        }).catch((error) => {
          console.error(error);
        });

        
        console.log('Status:', this.status);
        console.log('Timestamp:', this.timestamp);
        console.log('Account ID:', this.accountId);
        console.log('Username:', this.username);

        if(localStorage.getItem('username')){
          this.username = this.accountSvc.username
          this.accountId = this.accountSvc.account_id
        } 
        

      //initialise portfolio (cumulative)
      this.portfolioSymbols$ = this.stockSvc.getPortfolioSymbols(this.accountId)
      console.info('this.symbols$ is' + this.portfolioSymbols$)

      this.allTradesData$ = this.stockSvc.getAllTradesData(this.accountId)
  
      this.portfolioSymbols$.then((symbol: string[]) => {
        console.info('Symbols:', symbol);
        this.portfolioData$ = this.stockSvc.getPortfolioData(symbol, this.accountId);
      }).catch((error) => {
        console.error(error);
      });


      this.stockSymbol$ = this.stockSvc.onStockSelection
      console.info('I am in dashboard')
      this.symbol=this.stockSvc.symbol
      this.symbols = this.stockSvc.symbols
      console.info('this.symbols in ngOnInit are:' + this.symbols)

      // this.tradeResponse$.pipe(
      //   switchMap(() => {
      //     return this.stockSvc.getPortfolioSymbols(this.accountId);
      //   })
      // ).subscribe(
      //   (symbol: string[]) => {
      //     console.info('Symbols:', symbol);
      //     this.portfolioData$ = this.stockSvc.getPortfolioData(symbol, this.accountId);
      //     this.allTradesData$ = this.stockSvc.getAllTradesData(this.accountId)
      //   },
      //   (error) => {
      //     console.error(error);
      //   }
      // );

}


viewStock(symbol:string){
    console.info('Printed the symbol:'+ symbol)
    this.stockSvc.symbol = symbol

    const symbolPromise = new Promise((resolve) => {
      resolve(this.stockSvc.symbol);
    });

    symbolPromise.then(() => {
      this.router.navigate(['research']);
    });

  }


  calculateTotalReturn(portfolioData: any[]): number {
    return portfolioData.reduce((total, data) => total + data.total_return, 0);
  }

  calculateTotalPercentageReturn(portfolioData: any[]): number {
    const totalReturn = this.calculateTotalReturn(portfolioData);
    const totalInvestment = portfolioData.reduce((total, data) => total + data.buy_total_price, 0);
    return (totalReturn / totalInvestment) * 100;
  }

  ngOnDestroy() {
    this.loginSubscription$.unsubscribe();
  }

 
}
