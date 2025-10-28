import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherFormComponent } from './weather-form/weather-form.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import Highcharts from 'highcharts';
import { MyChartOptions, SharedService } from './services/shared.service';
import { HighchartsChartComponent } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { GeocodingService } from './services/geocoding.service';
import { WeatherService } from './services/weather.service';
import { downloadJsonData } from './utils/common';

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
  addressReceived: string = '';

  scrollToForm() {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  constructor(
    private geoService: GeocodingService,
    private weatherService: WeatherService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.sharedService.windCurrentData.subscribe((data) => {
      if (Object.keys(data).length === 0) return;
      this.updatedAt = new Date().toLocaleTimeString();
      this.windChartOptions = { ...data };
    });
    this.sharedService.tempCurrentData.subscribe((data) => {
      if (Object.keys(data).length === 0) return;
      this.updatedAt = new Date().toLocaleTimeString();
      this.tempChartOptions = { ...data };
    });
    this.sharedService.humCurrentData.subscribe((data) => {
      if (Object.keys(data).length === 0) return;
      this.updatedAt = new Date().toLocaleTimeString();
      this.humChartOptions = { ...data };
    });
  }

  onAddressReceived(address: string) {
    this.addressReceived = address;
  }

  async exportLastYear() {
    const coordinatesResponse = await this.getCoordinates(this.addressReceived);
    const coords = coordinatesResponse?.geometry;
    const data = await this.getWeatherData(coords.lat, coords.lng);
    downloadJsonData(data);
  }

  async getCoordinates(address: string): Promise<{ geometry: { lat: number; lng: number } }> {
    return this.geoService.getCoordinates(address);
  }

  async getWeatherData(lat: number, lng: number): Promise<any> {
    return this.weatherService.getWeatherDataLastYear(lat, lng);
  }
}
