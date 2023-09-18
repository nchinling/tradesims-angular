import { Component, Injectable, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Observable } from 'rxjs';
import { ChartService } from '../services/chart.service';
import { StockService } from '../services/stock.service';
import { ResearchComponent } from './research.component';
import { ChartInfo } from '../models';
import { AccountService } from '../services/account.service';
Chart.register(...registerables);


@Component({
  selector: 'app-research-chart',
  templateUrl: './research-chart.component.html',
  styleUrls: ['./research-chart.component.css']
})
export class ResearchChartComponent {

  chart$!: Observable<ChartInfo>
  bottomChart$!: Observable<ChartInfo>
  symbol!:string
  dashboardSymbol!:string
 
  accountId!:string
  canvasHeight: number = 130; 
  previousSymbol='AAPL'
  initialSymbol='AAPL'
  portfolioSymbols: string[] = [];
  stock_name!:string
  loadInterval: string = '1min'
  initialLoad=true
  interval!: string
  dataPoints!:number
  datasets!:any
  bottomDatasets!:any
  newDataPoints!:number
  previousDataPoints!:number
  averagePriceData: number[] = [];
  adx: number[] = [];
  wclprice: number[] = [];
  wma: number[] = [];
  add: number[] = [];
  chaikin: number[]=[];
  kama: number[]=[];
  beta: number[]=[];
  stdDev: number[]=[];
  rsi: number[]=[];
  mom: number[]=[];
  linearReg: number[]=[];
  ema: number[]=[];

chart!:any
bottomChart!:any
counter=1;

callTechnicalIndicators:boolean=false

  showAvgPrice: boolean = false;
  showADX: boolean = false;
  showADD: boolean = false;
  showWCLPrice: boolean = false;
  showWMA: boolean = false;
  showChaikin: boolean = false;
  showKama: boolean = false;
  showBeta: boolean = false;
  showStdDev: boolean = false;
  showRSI: boolean = false;
  showLinearReg: boolean = false;
  showMom: boolean = false;
  showEMA: boolean = false;
  

  fb = inject(FormBuilder)
  stockSvc = inject(StockService)
  accSvc = inject(AccountService)
  chartSvc = inject(ChartService)
  chartForm!: FormGroup
  researchComp = inject(ResearchComponent)

  ngOnInit(): void {
    this.dashboardSymbol = this.stockSvc.symbol
   
   console.info("The symbol in ngOnInit of research chart is " + this.symbol )


    console.info('the symbol in chart is: ' + this.symbol)
    this.chartForm = this.createForm()

    //obtains symbol from researchComponent's search symbol
    this.researchComp.updatedChartData.subscribe((data) => {
      this.symbol = data.symbol;
      this.stock_name = data.stock_name;
    
      this.showAvgPrice = false
      this.showKama = false
      this.showChaikin = false
      this.showADX = false
      this.showWCLPrice= false
      this.showWMA = false
      this.showADD = false
      this.showBeta = false
      this.showStdDev = false
      this.showRSI = false
      this.showMom = false
      this.showLinearReg = false
      this.showEMA = false
      this.initialLoad=true
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
  
    console.info('I am processing chart')
    console.info('this.symbol in processChart is' + this.symbol)

    this.interval = this.chartForm.get('interval')?.value ?? this.loadInterval;
    this.dataPoints = this.chartForm.get('dataPoints')?.value ?? 30;

    console.info("new: this.symbol is " + this.symbol)
    console.info("new: this.previousSymbol is " + this.previousSymbol)
    const sameSymbol = this.symbol === this.previousSymbol;
    const sameInterval = this.interval === this.loadInterval;
    const sameDataPoints = this.dataPoints === this.previousDataPoints;
    this.previousSymbol = this.symbol

    if (!this.showAvgPrice) this.averagePriceData = [];
    if (!this.showADX) this.adx = [];
    if (!this.showKama) this.kama = [];
    if (!this.showWCLPrice) this.wclprice = [];
    if (!this.showWMA) this.wma = [];
    if (!this.showADD) this.add = [];
    if (!this.showKama) this.kama = [];
    if (!this.showBeta) this.beta = [];
    if (!this.showStdDev) this.stdDev = [];
    if (!this.showRSI) this.rsi = [];
    if (!this.showMom) this.mom = [];
    if (!this.showLinearReg) this.linearReg = [];
    if (!this.showEMA) this.ema = [];

    if (!sameChart) {
      if (!sameSymbol || !sameInterval || !sameDataPoints) {
      // if (!sameSymbol) {
        this.showAvgPrice = false;
        this.showADX = false;
        this.showWCLPrice = false;
        this.showWMA = false;
        this.showADD = false;
        this.showChaikin = false;
        this.showKama = false;
        this.showBeta = false;
        this.showStdDev = false;
        this.showRSI = false;
        this.showMom = false;
        this.showLinearReg = false;
        this.showEMA = false;
      
      }

    }


    console.info('interval in processingChart is: ' + this.interval)
    console.info('dataPoints in processingChart is: ' + this.dataPoints)
    console.info('symbol in processingChart is: ' + this.symbol)

    if (this.symbol && this.interval && this.dataPoints) {
      console.info('>> symbol: ', this.symbol);
      console.info('>> interval: ', this.interval);
      console.info('>> interval: ', this.dataPoints);
      this.chart$ = this.chartSvc.getTimeSeries(this.dashboardSymbol? this.dashboardSymbol:this.symbol, this.interval, this.dataPoints); 
      console.info('dashboardSymbol in processingChart is: ' + this.dashboardSymbol)
      this.chart$.subscribe(chartData => {

        const labels = chartData.datetime.reverse()
        this.callTechnicalIndicators=true

        console.log('the labels are: '+ labels)
        this.datasets = [

          {
            label: 'Close',
            data: chartData.close.reverse(),
            backgroundColor: 'black',
            borderColor:'black',
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
            label: 'EMA', 
            data: this.showEMA? this.ema:'', 
            backgroundColor: 'grey',
            borderColor: 'grey',
            borderWidth: 1.5,
            pointRadius: 0,
          },
          {
            label: 'KAMA', 
            data: this.showKama? this.kama:'', 
            backgroundColor: 'blue',
            borderColor: 'blue',
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
            label: 'LinearReg', 
            data: this.showLinearReg ?this.linearReg:'', 
            backgroundColor: '#D61E68',
            borderColor: '#D61E68',
            borderWidth: 1.5,
            pointRadius: 0,
          },
        
        ];

        this.bottomDatasets = [

          {
            label: 'Chaikin A/D',
            data: this.showChaikin? this.chaikin:'', 
            backgroundColor: '#2EC6EC',
            borderColor:'#2EC6EC',
            borderWidth: 1,
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
          {
            label: 'ADX', 
            data: this.showADX? this.adx:'', 
            backgroundColor: 'orange',
            borderColor: 'orange',
            borderWidth: 1.5  ,
            pointRadius: 0,
          },
          {
            label: 'MOM', 
            data: this.showMom? this.mom:'', 
            backgroundColor: '#3B71CA',
            borderColor: '#3B71CA',
            borderWidth: 1.5  ,
            pointRadius: 0,
          },
          {
            label: 'RSI', 
            data: this.showRSI? this.rsi:'', 
            backgroundColor: 'mediumseagreen',
            borderColor: 'mediumseagreen',
            borderWidth: 1.5  ,
            pointRadius: 0,
          },
          {
            label: 'β', 
            data: this.showBeta? this.beta:'', 
            backgroundColor: 'green',
            borderColor: 'green',
            borderWidth: 1.5  ,
            pointRadius: 0,
          },
          {
            label: 'σ', 
            data: this.showStdDev? this.stdDev:'', 
            backgroundColor: 'brown',
            borderColor: 'brown',
            borderWidth: 1.5  ,
            pointRadius: 0,
          },
        ]

       
      if (sameChart) {

          console.info("the status of sameChart is " + sameChart)
          this.chart.data.labels = labels;
          this.chart.data.datasets = this.datasets;
          this.chart.update();

          this.bottomChart.data.labels = labels;
          this.bottomChart.data.datasets = this.bottomDatasets;
          this.bottomChart.update();
          console.info("It is an update")
      } 

      else if (this.dashboardSymbol){
        this.symbol = this.dashboardSymbol
        this.dashboardSymbol=''
        this.chart = new Chart('priceChart', {
          type: 'line',
          data: {
            labels: labels,
            datasets: this.datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                display: true, 
                ticks: {
                  autoSkip: true, 
                  maxTicksLimit: 6, 
                  
                },
              },
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

        this.bottomChart = new Chart('bottomChart', {
          type: 'line',
          data: {
            labels: labels,
            datasets: this.bottomDatasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x:{
                display: false
              }
            },
            plugins:{
              title: {
                display: false,
                text: this.stock_name,
                font:{
                  size: 20
                }
              }
            },
          }
        });

      }
      
      else {

        if((!sameSymbol || !sameInterval || !sameDataPoints&&(this.symbol!=this.initialSymbol))){
          this.chart.destroy()
          this.bottomChart.destroy()
        }
        
        this.initialSymbol='TEST'

        console.info("chartData.close in this.chart is " + chartData.close)
        console.info("the status of sameChart is " + sameChart)
        this.chart = new Chart('priceChart', {
          type: 'line',
          data: {
            labels: labels,
            datasets: this.datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                display: true, 
                ticks: {
                  autoSkip: true, 
                  maxTicksLimit: 6, 
                 
                },
              },
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

        this.bottomChart = new Chart('bottomChart', {
          type: 'line',
          data: {
            labels: labels,
            datasets: this.bottomDatasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x:{
                display: false
              }
            },
            plugins:{
              title: {
                display: false,
                text: this.stock_name,
                font:{
                  size: 20
                }
              }
            },
          }
        });


      }
    });

    
    
  }
}


  getTechnicalIndicator(indicator:string) {

    this.interval = this.chartForm.get('interval')?.value ?? this.loadInterval;
    this.dataPoints = this.chartForm.get('dataPoints')?.value ?? 30;

    this.loadInterval = this.interval
    // this.previousSymbol = this.symbol
    this.previousDataPoints = this.dataPoints

    this.chartSvc.getTechnicalIndicator(indicator,this.symbol, this.interval, this.dataPoints).subscribe((ChartIndicatorData) => {
    
      if(indicator=="avgprice"){
      this.averagePriceData = ChartIndicatorData.indicatorData.reverse();
      this.showAvgPrice = !this.showAvgPrice
      console.log('Average Price:', this.averagePriceData);
      }
      else if (indicator=="adx"){
      this.adx = ChartIndicatorData.indicatorData.reverse();
      this.showADX = !this.showADX
      console.log('ADX:', this.adx);
      }
      else if (indicator=="ema"){
        this.ema = ChartIndicatorData.indicatorData.reverse();
        this.showEMA = !this.showEMA
        console.log('ema:', this.ema);
      }
      else if (indicator=="linearreg"){
        this.linearReg = ChartIndicatorData.indicatorData.reverse();
        this.showLinearReg = !this.showLinearReg
        console.log('ADX:', this.adx);
      }
      else if (indicator=="mom"){
        this.mom = ChartIndicatorData.indicatorData.reverse();
        this.showMom = !this.showMom
        console.log('mom:', this.mom);
      }
      else if (indicator=="stddev"){
        this.stdDev = ChartIndicatorData.indicatorData.reverse();
        this.showStdDev = !this.showStdDev
        console.log('stdDev:', this.stdDev);
      }
      else if (indicator=="rsi"){
        this.rsi = ChartIndicatorData.indicatorData.reverse();
        this.showRSI = !this.showRSI
        console.log('rsi:', this.rsi);
      }
      else if (indicator=="kama"){
        this.kama = ChartIndicatorData.indicatorData.reverse();
        this.showKama = !this.showKama
        console.log('Kama:', this.kama);
      }
      else if (indicator=="beta"){
        this.beta = ChartIndicatorData.indicatorData.reverse();
        this.showBeta = !this.showBeta
        console.log('Beta:', this.beta);
      }
      else if (indicator=="adosc"){
        this.chaikin = ChartIndicatorData.indicatorData.reverse();
        this.showChaikin = !this.showChaikin
        console.log('Chaikin:', this.chaikin);
        }
      else if (indicator=="wclprice"){
        this.wclprice = ChartIndicatorData.indicatorData.reverse();
        this.showWCLPrice = !this.showWCLPrice
        console.log('wclprice:', this.wclprice);
      }
      else if (indicator=="wma"){
        this.wma = ChartIndicatorData.indicatorData.reverse();
        this.showWMA = !this.showWMA
        console.log('wma:', this.wma);
      }
      else if(indicator=="add"){
        this.add = ChartIndicatorData.indicatorData.reverse();
        this.showADD = !this.showADD
        console.log('ADD:', this.add);
      }

      this.processChart(true);
    });
  }

    zoomIn() {
      console.info("I am inside zoomIn")
      const currentDataPoints = this.chartForm.get('dataPoints')?.value;
      const zoomFactor = 2; // You can adjust this value based on your desired zoom level.
      this.newDataPoints = Math.floor(currentDataPoints / zoomFactor);
    
      // Limit the minimum number of data points
      const minDataPoints = 1;
    
      if (this.newDataPoints >= minDataPoints) {
        this.chartForm.get('dataPoints')?.setValue(this.newDataPoints);
      }
  
    }
    
    zoomOut() {
      console.info("I am inside zoomOut")
      const currentDataPoints = this.chartForm.get('dataPoints')?.value;
      const zoomFactor = 2; 
      this.newDataPoints = Math.floor(currentDataPoints * zoomFactor);
    
     
      const maxDataPoints = 5000; 
    
      if (this.newDataPoints <= maxDataPoints) {
        this.chartForm.get('dataPoints')?.setValue(this.newDataPoints);
      }
   
    }
    
}
