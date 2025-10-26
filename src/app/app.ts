import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherFormComponent } from './weather-form/weather-form.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import Highcharts from 'highcharts';
import { MyChartOptions, SharedService } from './services/shared.service';
import { HighchartsChartComponent } from 'highcharts-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WeatherFormComponent, LineChartComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App {
  protected readonly title = signal('weather-app');
  updatedAt: string | undefined = undefined;
  tempChartOptions: MyChartOptions = {};
  windChartOptions: MyChartOptions = {};
  humChartOptions: MyChartOptions = {};
  Highcharts: typeof Highcharts = Highcharts; // 👈 aggiunto
  @ViewChild(HighchartsChartComponent) chartRef!: HighchartsChartComponent;

  scrollToForm() {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.windCurrentData.subscribe((data) => {
      this.updatedAt = new Date().toLocaleTimeString();
      this.windChartOptions = { ...data };
    });
    this.sharedService.tempCurrentData.subscribe((data) => {
      this.updatedAt = new Date().toLocaleTimeString();
      this.tempChartOptions = { ...data };
    });
    this.sharedService.humCurrentData.subscribe((data) => {
      this.updatedAt = new Date().toLocaleTimeString();
      this.humChartOptions = { ...data };
    });
  }
}
