import { Component, Injectable, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Observable } from 'rxjs';
import { ChartService } from '../services/chart.service';
import { StockService } from '../services/stock.service';
import { ResearchComponent } from './research.component';
import { ChartInfo } from '../models';
Chart.register(...registerables);


@Component({
  selector: 'app-research-chart',
  templateUrl: './research-chart.component.html',
  styleUrls: ['./research-chart.component.css']
})
export class ResearchChartComponent {

  chart$!: Observable<ChartInfo>
  symbol!:string
  previousSymbol!:string
  stock_name!:string
  chart!:any
  loadInterval: string = '1min'
  interval!: string
  dataPoints!:number
  previousDataPoints!:number
  averagePriceData: number[] = [];
  adx: number[] = [];
  wclprice: number[] = [];
  wma: number[] = [];
  add: number[] = [];

  showAvgPrice: boolean = false;
  showADX: boolean = false;
  showADD: boolean = false;
  showWCLPrice: boolean = false;
  showWMA: boolean = false;

  fb = inject(FormBuilder)
  stockSvc = inject(StockService)
  chartSvc = inject(ChartService)
  chartForm!: FormGroup
  researchComp = inject(ResearchComponent)

  ngOnInit(): void {
    this.symbol = this.stockSvc.symbol

    console.info('the symbol in chart is: ' + this.symbol)
    this.chartForm = this.createForm()
    this.researchComp.updatedChartData.subscribe((data) => {
      this.symbol = data.symbol;
      this.stock_name = data.stock_name;
      // this.showAvgPrice = !this.showAvgPrice;
      // this.showADX = !this.showADX;
      // this.showWCLPrice= !this.showWCLPrice;
      // this.showWMA = !this.showWMA;
      this.showAvgPrice = false
      this.showADX = false
      this.showWCLPrice= false
      this.showWMA = false
      this.showADD = false
    this.processChart()
    })
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['symbol'] &&
      !changes['symbol'].firstChange &&
      changes['symbol'].currentValue !== changes['symbol'].previousValue
    ) {
      this.processChart();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      interval: this.fb.control<string>(this.loadInterval, [ Validators.required ]),
      dataPoints: this.fb.control<number>(30, [ Validators.required,  Validators.min(1), Validators.max(5000) ])
    })
  }

  invalidField(ctrlName:string): boolean{
    return !!(this.chartForm.get(ctrlName)?.invalid && this.chartForm.get(ctrlName)?.dirty)
  }

  createChart(){
    this.processChart()
  }


  private processChart(sameChart: boolean = false) {
  
    if (this.chart) {
      this.chart.destroy();
    }

    console.info('I am processing chart')
    console.info('this.symbol in processChart is' + this.symbol)

    this.interval = this.chartForm.get('interval')?.value ?? this.loadInterval;
    this.dataPoints = this.chartForm.get('dataPoints')?.value ?? 30;
    //this.symbol = this.symbol !== '' ? this.symbol : this.initialChartSymbol;

    const sameSymbol = this.symbol === this.previousSymbol;
    const sameInterval = this.interval === this.loadInterval;
    const sameDataPoints = this.dataPoints === this.previousDataPoints;

    if (!sameChart) {
      if (!sameSymbol || !sameInterval || !sameDataPoints) {
        this.showAvgPrice = false;
        this.showADX = false;
        this.showWCLPrice = false;
        this.showWMA = false;
        this.showADD = false;
      }
        this.averagePriceData = [];
        this.adx = [];
        this.wclprice = [];
        this.wma = [];
        this.add = [];
    
    }

    // if (this.averagePriceData) {
    //   this.averagePriceData = [];
    // }

    console.info('interval in processingChart is: ' + this.interval)
    console.info('dataPoints in processingChart is: ' + this.dataPoints)
    console.info('symbol in processingChart is: ' + this.symbol)

    if (this.symbol && this.interval && this.dataPoints) {
      console.info('>> symbol: ', this.symbol);
      console.info('>> interval: ', this.interval);
      console.info('>> interval: ', this.dataPoints);
      this.chart$ = this.chartSvc.getTimeSeries(this.symbol, this.interval, this.dataPoints); 

      
      this.chart$.subscribe(chartData => {
      
        const labels = chartData.datetime.reverse()
        console.log('the labels are: '+ labels)
        const datasets = [
          // {
          //   label: 'Open',
          //   data: chartData.open,
          //   backgroundColor: 'blue',
          //   borderColor:'blue'
          // },
          // {
          //   label: 'High',
          //   data: chartData.high,
          //   backgroundColor: 'limegreen',
          //   borderColor:'limegreen'
          // },
          // {
          //   label: 'Low',
          //   data: chartData.low,
          //   backgroundColor: 'red',
          //   borderColor:'red'
          // },
          {
            label: 'Close',
            data: chartData.close,
            backgroundColor: 'blue',
            borderColor:'blue',
            borderWidth: 1,
            pointRadius: 0,
          },
          {
            label: 'Avg. Price', 
            data: this.showAvgPrice? this.averagePriceData:'', 
            backgroundColor: 'red',
            borderColor: 'red',
            borderWidth: 1.5,
            pointRadius: 0,
          },
          {
            label: 'WCLPrice', 
            data: this.showWCLPrice? this.wclprice:'', 
            backgroundColor: 'limegreen',
            borderColor: 'limegreen',
            borderWidth: 1.5,
            pointRadius: 0,
          },
          {
            label: 'WMA', 
            data: this.showWMA ?this.wma:'', 
            backgroundColor: 'purple',
            borderColor: 'purple',
            borderWidth: 1.5,
            pointRadius: 0,
          },
          {
            label: 'ADX', 
            data: this.showADX? this.adx:'', 
            backgroundColor: 'orange',
            borderColor: 'orange',
            borderWidth: 1.5  ,
            pointRadius: 0,
          },
          {
            label: 'ADD', 
            data: this.showADD? this.add:'', 
            backgroundColor: 'pink',
            borderColor: 'pink',
            borderWidth: 1.5  ,
            pointRadius: 0,
          },
        ];


        this.chart = new Chart('priceChart', {
          type: 'line',
          data: {
            labels: labels,
            datasets: datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              // x:{
              //   display: false
              // }
            },
            plugins:{
              title: {
                display: true,
                text: this.stock_name,
                font:{
                  size: 20
                }
              }
            },
            
         
       
          }

        });

        
      });
    }
  

    }


    getTechnicalIndicator(indicator:string) {

      this.interval = this.chartForm.get('interval')?.value ?? this.loadInterval;
      this.dataPoints = this.chartForm.get('dataPoints')?.value ?? 30;

      this.loadInterval = this.interval
      this.previousSymbol = this.symbol
      this.previousDataPoints = this.dataPoints
 
      this.chartSvc.getTechnicalIndicator(indicator,this.symbol, this.interval, this.dataPoints).subscribe((ChartIndicatorData) => {
      
        if(indicator=="avgprice"){
        this.averagePriceData = ChartIndicatorData.indicatorData;
        this.showAvgPrice = !this.showAvgPrice
        this.showADX = false
        this.showWCLPrice = false
        this.showWMA = false
        this.showADD = false
        console.log('Average Price:', this.averagePriceData);
        }
        else if (indicator=="adx"){
        this.adx = ChartIndicatorData.indicatorData;
        this.showADX = !this.showADX
        this.showAvgPrice=false;
        this.showWCLPrice=false;
        this.showWMA=false;
        this.showADD = false
        console.log('ADX:', this.adx);
        }
        else if (indicator=="wclprice"){
          this.wclprice = ChartIndicatorData.indicatorData;
          this.showWCLPrice = !this.showWCLPrice
          this.showADX=false;
          this.showAvgPrice=false;
          this.showWMA=false;
          this.showADD = false
          console.log('wclprice:', this.wclprice);
        }
        else if (indicator=="wma"){
          this.wma = ChartIndicatorData.indicatorData;
          this.showWMA = !this.showWMA
          this.showADX=false;
          this.showAvgPrice=false;
          this.showWCLPrice=false;
          this.showADD = false
          console.log('wma:', this.wma);
        }
        else if(indicator=="add"){
          this.add = ChartIndicatorData.indicatorData;
          this.showADD = !this.showADD
          this.showADX = false
          this.showWCLPrice = false
          this.showWMA = false
          this.showAvgPrice = false
          console.log('ADD:', this.add);
        }

        this.processChart(true);
      });
    }


    zoomIn() {
      const currentDataPoints = this.chartForm.get('dataPoints')?.value;
      const zoomFactor = 2; // You can adjust this value based on your desired zoom level.
      const newDataPoints = Math.floor(currentDataPoints / zoomFactor);
    
      // Limit the minimum number of data points
      const minDataPoints = 1;
    
      if (newDataPoints >= minDataPoints) {
        this.chartForm.get('dataPoints')?.setValue(newDataPoints);
        this.processChart(true);
      }
    }
    
    zoomOut() {
      const currentDataPoints = this.chartForm.get('dataPoints')?.value;
      const zoomFactor = 2; 
      const newDataPoints = Math.floor(currentDataPoints * zoomFactor);
    
      // Limit the maximum number of data points
      const maxDataPoints = 5000; 
    
      if (newDataPoints <= maxDataPoints) {
        this.chartForm.get('dataPoints')?.setValue(newDataPoints);
        this.processChart(true);
      }
    }
    

    

}
