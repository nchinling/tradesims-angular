import { HttpParams, HttpHeaders, HttpErrorResponse, HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError, filter, tap, Subject, firstValueFrom } from "rxjs";
import { LoginResponse, RegisterResponse, TradeData, TradeResponse, UserData } from "../models";
import { ChangeDetectorRef, Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";

const URL_API_TRADE_SERVER = 'http://localhost:8080/api'
// const URL_API_TRADE_SERVER = '/api'

@Injectable()
export class AccountService {

  onLoginRequest = new Subject<LoginResponse>()
  onRegisterRequest = new Subject<RegisterResponse>()
  onSavePortfolioRequest = new Subject<TradeResponse>()
//   onErrorResponse = new Subject<ErrorResponse>()
  onErrorMessage = new Subject<string>()
  isLoggedInChanged = new Subject<boolean>()

  http=inject(HttpClient)
  router = inject(Router)
  // cdr = inject(ChangeDetectorRef)

  username = "";
  email = "";
  password = "";
  queryParams: any;
  account_id = ""
  cash!: number;
  KEY = "username"
  key!: string


  // hasLogin(): boolean {
  //   if(this.username&&this.password)
  //     localStorage.setItem(this.KEY, this.username)
  //   //   const isLoggedIn = !!(this.username && this.password);
  //     const isLoggedIn = true;
  //     this.isLoggedInChanged.next(isLoggedIn);
  //   return isLoggedIn;
 
  // }

  hasLogin(): boolean {
    if(this.username&&this.password)
      localStorage.setItem(this.KEY, this.username)
      const isLoggedIn = !!(this.username && this.password);
      this.isLoggedInChanged.next(isLoggedIn);
    return isLoggedIn;
 
  }


  logout(): void {
    localStorage.removeItem(this.KEY);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem(this.KEY) !== null;
  }


  registerAccount(data: UserData ): Observable<RegisterResponse> {

    const form = new HttpParams()
      .set("name", data.name)
      .set("username", data.username)
      .set("email", data.email)
      .set("password", data.password)


    const headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")

    return this.http.post<RegisterResponse>(`${URL_API_TRADE_SERVER}/register`, form.toString(), {headers}).pipe(

      filter((response) => response !== null), 

      //the fired onRequest.next is received in dashboard component's ngOnit 
      tap(response => this.onRegisterRequest.next(response))
    );
    
  }


login(email: string, password: string): Observable<LoginResponse> {

    const form = new HttpParams()
      .set("email", email)
      .set("password", password)

    const headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")

    return this.http.post<LoginResponse>(`${URL_API_TRADE_SERVER}/login`, form.toString(), {headers}).pipe(
      catchError(error => {
        let errorMessage = 'An error occurred during login: ' + error.message;
        console.error(errorMessage);
        
        if (error instanceof HttpErrorResponse && error.status === 500) {
          const serverError = error.error.error; 
          errorMessage = serverError;
        }
        
        this.onErrorMessage.next(errorMessage);
        return throwError(() => ({ error: errorMessage }));
      }),
      filter((response) => response !== null), 
      //the fired onLoginRequest.next is received in dashboard component's ngOnit 
      tap(response => {
        console.info('Login response:', response);
        this.username = response.username;
        this.account_id = response.account_id;
        this.cash = response.cash;
        // Handle successful login response here
        this.onLoginRequest.next(response);
        // this.cdr.detectChanges();
    
      })
      

    );
  }

  
  saveToPortfolio(data: TradeData ): Observable<TradeResponse> {

    console.info('I am passing to saveToPortfolio units:' + data.units)
    console.info('I am passing to saveToPortfolio price:' + data.price)

    const form = new HttpParams()
      .set("account_id", data.accountId)
      .set("username", data.username)
      .set("exchange", data.exchange)
      .set("action", data.action)
      .set("symbol", data.symbol)
      .set("stockName", data.stockName)
      .set("units", data.units)
      .set("price", data.price)
      .set("currency", data.currency)
      // .set("fee", data.fee)
      .set("date", data.date.toString())

      const dateValue = form.get('date');
      console.log("the date in buyform is " +dateValue);

    console.info('account_id in savePortfolio: ' + data.accountId)
    console.info('username in savePortfolio: ' + data.username)
    console.info('stockName in savePortfolio: ' + data.stockName)
    console.info('currency in savePortfolio: ' + data.currency)

    const headers = new HttpHeaders()
      .set("Content-Type", "application/x-www-form-urlencoded")

    return this.http.post<TradeResponse>(`${URL_API_TRADE_SERVER}/savetoportfolio`, form.toString(), {headers}).pipe(
      catchError(error => {
        let errorMessage = 'An error occurred while adding to portfolio: ' + error.message;
        console.error(errorMessage);
        
        if (error instanceof HttpErrorResponse && error.status === 500) {
          const serverError = error.error.error; 
          errorMessage = '>>>Server error: ' + serverError;
        }
        
        this.onErrorMessage.next(errorMessage);
        return throwError(() => ({ error: errorMessage }));
      }),

      filter((response) => response !== null), 
      //the fired onRequest.next is received in dashboard component's ngOnit 
      tap(response => this.onSavePortfolioRequest.next(response))
    );
    
  }


  deleteTrade(sellData: TradeData){
      
    console.info('sending symbol to Stock server with ' + sellData.symbol);
    console.info('the sell date is ' + sellData.date);

    const datePipe = new DatePipe('en-US');


if (sellData.date) {
  const formattedDate = datePipe.transform(sellData.date, 'yyyy-MM-dd');
  sellData.date = formattedDate as unknown as Date;
} 
    const sellDataJson = JSON.stringify(sellData);

    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    const url = `${URL_API_TRADE_SERVER}/tradesList`;

    const options = {
      headers: headers,
      body: sellDataJson,
    };


    return this.http.delete<TradeResponse>(url, options).pipe(
      tap(response => this.onSavePortfolioRequest.next(response))
    );  
    

  }


}