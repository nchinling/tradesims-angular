# Tradesims - Trading Simulator

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## Introduction
TradeSims is a stock trading simulation app. It uses real data from the US stock market. 

It is built with Angular(frontend), Spring Boot (backend) with SQL, Redis and MongoDB as databases.

Some exciting implementations in Tradeus include charting, creation of watch list and ability to create personal portfolios which displays real time update of stock profits calculated using both annualised and total profits. 



### Technology
- Angular *Typescript*
- Spring Boot *Java*
- Chart JS *Javascript*
- ngBootStrap and Bootstrap 
- Java Mail
- Web Sockets
- Stripe E-payment

### Using TradeSims

### Features



### Progress Log
6 Aug (Sun)
- created base files
- created log in page, navbar, main page
- created Spring backend
- created tradesims database

9 Aug (Wed)
- created Bootstrap modal form
- created css animation

11 Aug (Fri)
- fixed modal buy form submission

13 Aug (Sun)
- implemented returns, total returns
- improved user interface

14 Aug (Mon)
- adjust duration of stock data stored in trades to 1 day
- Adjust accuracy of stock data
- Implement list of all trades
- implement sql 'available cash' in account

15 Aug (Tues)
- implemented sql 'available cash' in account

16 Aug (Wed)
- updated cash balance in sql

18 Aug (Fri)
- updated cash balance accurately

21 Aug (Mon)
- implement delete function
- create trade log to include 'sell'

22 Aug (Tues)
- implemented delete function
- implemented update cash balance and total amount
- implemented total balance


23 Aug (Wed)
- work on providing correct date

24 Aug (Thu)
- corrected accuracy on profit

25 Aug (Fri)
- implemented toggle rows
- worked on accuracy of profit
- row removed automatically when 0 units
- corrected date for sell
- remove code that is not required in calculating profit

26 Aug (Sat)
- enable 0% to be reflected
- work on providing error messages
- charts for charting 
- charts for research

