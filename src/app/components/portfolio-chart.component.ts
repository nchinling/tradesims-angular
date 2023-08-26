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
    this.ctx = document.getElementById('myChart');
    this.ctx2 = document.getElementById('myChart2');

   
      this.updateCashBalance();
      console.log("The cashBalance in portfolio is " + this.cashBalance)

  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['portfolioData$']) {
      this.updateChart();
    }
    if (changes['cashBalance']){
      this.updateCashBalance();
    }
}

private updateCashBalance(): void{

  if (this.cashBalance) {

    if (this.ctx2) {
          const chart = new Chart(this.ctx2, {
            type: 'pie',
            data: {
              labels: ['Cash', 'Stocks'],
              datasets: [{
                data: [this.cashBalance, this.stocksValue],
                backgroundColor: [
                  'green',
                  'blue',
                  'yellow',
                  'red',
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


}