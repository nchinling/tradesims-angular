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

  ctx!:any
  ctx2!:any



  ngOnInit(): void {
    this.ctx = document.getElementById('myChart');
    this.ctx2 = document.getElementById('myChart2');

    // new Chart(this.ctx, {
    //   type: 'pie', // Change the chart type to 'pie'
    //   data: {
    //     labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    //     datasets: [{
    //       data: [12, 19, 3, 5, 2, 3], // Data points for each segment
    //       backgroundColor: [
    //         'red',
    //         'blue',
    //         'yellow',
    //         'green',
    //         'purple',
    //         'orange'
    //       ] // Customize colors as needed
    //     }]
    //   },
    //   options: {
    //     responsive: true, // Make the chart responsive
    //     maintainAspectRatio: false,
    //   }
    // });

    
    new Chart(this.ctx2, {
      type: 'pie', // Change the chart type to 'pie'
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          data: [12, 19, 3, 5, 2, 3], // Data points for each segment
          backgroundColor: [
            'red',
            'blue',
            'yellow',
            'green',
            'purple',
            'orange'
          ] // Customize colors as needed
        }]
      },
      options: {
        responsive: true, // Make the chart responsive
        maintainAspectRatio: false,
      }
    });


  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['portfolioData$']) {
      this.updateChart();
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