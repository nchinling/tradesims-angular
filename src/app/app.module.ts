import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { MainComponent } from './components/main.component';
import { RegisterComponent } from './components/register.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'
import { AccountService } from './services/account.service';
import { NavbarComponent } from './components/navbar.component';
import { DashboardComponent } from './components/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LeaderboardComponent } from './components/leaderboard.component';
import { ResearchComponent } from './components/research.component';
import { TradeComponent } from './components/trade.component';
import { loginGuard } from './util';
import { StockService } from './services/stock.service';
import { PortfolioChartComponent } from './components/portfolio-chart.component';

const appRoutes: Routes = [
  { path: '', component: MainComponent, title: 'Welcome to TradeSIMS' },
  { path: 'login', component: LoginComponent, title: 'Log In' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard', canActivate: [loginGuard] },
  { path: 'research', component: ResearchComponent, title: 'Research', canActivate: [loginGuard] },
  // { path: 'trade', component: TradeComponent, title: 'Trade', canActivate: [loginGuard] },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
]


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent, 
    RegisterComponent, NavbarComponent, DashboardComponent, 
    LeaderboardComponent, ResearchComponent, TradeComponent, PortfolioChartComponent
  ],
  imports: [
    BrowserModule, ReactiveFormsModule, FormsModule, HttpClientModule,
    RouterModule.forRoot(appRoutes, { useHash: true}),
    NgbModule,
  ],
  exports: [RouterModule],
  providers: [AccountService, StockService],
  bootstrap: [AppComponent]
})
export class AppModule { }
