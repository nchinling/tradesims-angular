import { Component,Input,OnChanges,OnInit, SimpleChanges } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { PortfolioData } from '../models';
Chart.register(...registerables);

@Component({
  selector: 'app-portfolio-chart',
  templateUrl: './portfolio-chart.component.html',
  styleUrls: ['./portfolio-chart.component.css']
})
export class PortfolioChartComponent implements OnInit, OnChanges {

  @Input() portfolioData$!: Promise<PortfolioData[]> 
  @Input() cashBalance!:number
  @Input() stocksValue!:number

  ctx!:any
  ctx2!:any

  ngOnInit(): void {

    this.createOrUpdateCharts();
    // this.ctx = document.getElementById('myChart');
    // this.ctx2 = document.getElementById('myChart2');

      this.updateCashBalance();
      console.log("The cashBalance in portfolio is " + this.cashBalance)

  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (changes['portfolioData$']) {
    //   this.updateChart();
    // }
    // if (changes['cashBalance']){
    //   this.updateCashBalance();
    // }
    if (changes['portfolioData$'] || changes['cashBalance']) {
      this.createOrUpdateCharts();
    }
}

private updateCashBalance(): void{
  if (this.cashBalance) {

    if (this.ctx2) {
          const chart = new Chart(this.ctx2, {
            type: 'doughnut',
            data: {
              labels: ['Cash', 'Stocks'],
              datasets: [{
                data: [this.cashBalance, this.stocksValue],
                backgroundColor: [
                  'orange',
                  'blue',
                  'yellow',
                  'red',
                  'purple',
                  'green'
                ] 
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
            }
          });
        }
  }

}

  private updateChart(): void {

    if (this.portfolioData$) {
      this.portfolioData$.then(data => {

        const filteredData = data.filter(item => item.units > 0);

        if (filteredData.length > 0) {
          const labels = filteredData.map(item => item.stock_name);
          const datasetData = filteredData.map(item => item.units * item.unit_current_price);

          if (this.ctx) {
            const chart = new Chart(this.ctx, {
              type: 'pie',
              data: {
                labels: labels,
                datasets: [{
                  data: datasetData,
                  backgroundColor: [
                    'red',
                    'blue',
                    'yellow',
                    'green',
                    'purple',
                    'orange'
                  ] 
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              }
            });
          }
        }
      });
    }
  }

  private createOrUpdateCharts(): void {
    if (this.ctx) {
      const chartInstance = Chart.getChart(this.ctx); 
      if (chartInstance) {
        chartInstance.destroy(); 
      }
    }
    

    if (this.ctx2) {
      const chartInstance = Chart.getChart(this.ctx2); 
      if (chartInstance) {
        chartInstance.destroy(); 
      }
    }
    

    // Get the canvas elements after destroying the previous charts.
    this.ctx = document.getElementById('myChart');
    this.ctx2 = document.getElementById('myChart2');

    if (this.ctx) {
      this.updateChart();
    }

    if (this.ctx2) {
      this.updateCashBalance();
    }
  }


}