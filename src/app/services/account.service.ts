import { HttpParams, HttpHeaders, HttpErrorResponse, HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError, filter, tap, Subject } from "rxjs";
import { LoginResponse, RegisterResponse, TradeData, TradeResponse, UserData } from "../models";
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";

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

  username = "";
  password = "";
  queryParams: any;
  account_id = ""
  KEY = "username"
  key!: string


  hasLogin(): boolean {
    if(this.username&&this.password)
      localStorage.setItem(this.KEY, this.username)
    //   const isLoggedIn = !!(this.username && this.password);
      const isLoggedIn = true;
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

    return  this.http.post<LoginResponse>(`${URL_API_TRADE_SERVER}/login`, form.toString(), {headers}).pipe(
      catchError(error => {
        let errorMessage = 'An error occurred during login: ' + error.message;
        console.error(errorMessage);
        
        if (error instanceof HttpErrorResponse && error.status === 500) {
          const serverError = error.error.error; 
          errorMessage = '>>>Server error: ' + serverError;
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
        // Handle successful login response here
        this.onLoginRequest.next(response);
        // this.isLoggedInChanged.next(true); // Emit true to indicate user is logged in
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
      .set("symbol", data.symbol)
      .set("stockName", data.stockName)
      .set("units", data.units)
      .set("price", data.price)
      .set("currency", data.currency)
      // .set("fee", data.fee)
      .set("date", data.date.toString())

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



}