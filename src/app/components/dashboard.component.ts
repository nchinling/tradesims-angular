import { HttpClient } from '@angular/common/http';
import { Component, OnChanges, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { LoginResponse, PortfolioData, RegisterResponse } from '../models';
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
  router = inject(Router)
  title = inject(Title)
  http=inject(HttpClient)

  public notifications = 0;


  loginResponse$!: Observable<LoginResponse>
  registerResponse$!: Observable<RegisterResponse>
  errorMessage$!: Observable<string>
  username!: string
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

  // ENDPOINT!: string

  onStockRequest = new Subject<string>()


 ngOnInit():void{
    this.loginResponse$ = this.accountSvc.onLoginRequest
    this.registerResponse$ = this.accountSvc.onRegisterRequest
    this.errorMessage$ = this.accountSvc.onErrorMessage

    
        const queryParams = this.activatedRoute.snapshot.queryParams;
        
        this.status = queryParams['status'];
        this.timestamp = queryParams['timestamp'];
        this.accountId = queryParams['account_id'];
        this.username = queryParams['username'];
     

        // this.title.setTitle('Account')

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

 
}
