import { Component, Input, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, switchMap, from, firstValueFrom } from 'rxjs';
import { StockInfo, PortfolioData, TradeResponse, Stock, TradeData } from '../models';
import { AccountService } from '../services/account.service';
import { StockService } from '../services/stock.service';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.css']
})
export class TradeComponent {



}
