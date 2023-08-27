import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { ChartIndicatorData, ChartInfo } from "../models";

const URL_API_TRADE_SERVER = 'http://localhost:8080/api'
// const URL_API_TRADE_SERVER = '/api'

@Injectable()
export class ChartService {

    http = inject(HttpClient)
    
    getTimeSeries(symbol:string, interval:string, dataPoints: number): Observable<ChartInfo> {

        const queryParams = new HttpParams()
            .set('symbol', symbol)
            .set('interval', interval)
            .set('dataPoints', dataPoints)
        console.info('>>>>>>sending to Chart Controller...')
        
        return this.http.get<ChartInfo>(`${URL_API_TRADE_SERVER}/timeseries`, { params: queryParams })
            .pipe(
            //   tap(resp => this.onStockRequest.next(resp)),
              map(resp => ({ symbol: resp.symbol, interval: resp.interval, 
                          datetime: resp.datetime, open:resp.open, 
                          high:resp.high, low:resp.low,close:resp.close
                          }))
        )
    
    }

    // this.chartSvc.getTechnicalIndicator(indicator,this.symbol, interval, dataPoints)
    getTechnicalIndicator(indicator: string, symbol:string, interval:string, dataPoints: number): Observable<ChartIndicatorData> {

        const queryParams = new HttpParams()
            .set('indicator', indicator)
            .set('symbol', symbol)
            .set('interval', interval)
            .set('dataPoints', dataPoints)
        console.info('>>>>>>sending to Chart Controller to get Indicator...')
        
        return this.http.get<ChartIndicatorData>(`${URL_API_TRADE_SERVER}/indicator`, { params: queryParams })
            .pipe(
            //   tap(resp => this.onStockRequest.next(resp)),
              map(resp => ({ symbol: resp.symbol, interval: resp.interval, 
                          datetime: resp.datetime, indicatorData:resp.indicatorData, 
                          }))
        )
    
    }

}