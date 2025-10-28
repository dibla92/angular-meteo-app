import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GeocodingService, GeoResult } from '../services/geocoding.service';
import { WeatherService } from '../services/weather.service';
import * as Highcharts from 'highcharts';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MyChartOptions, SharedService } from '../services/shared.service';
import { getWeekRange, getYearRange } from '../utils/date';

@Component({
  selector: 'app-weather-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './weather-form.component.html',
  styleUrls: ['./weather-form.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // 👈 fallback
})
export class WeatherFormComponent implements OnInit {
  form!: FormGroup;
  tempChartOptions: MyChartOptions = {};
  windChartOptions: MyChartOptions = {};
  humChartOptions: MyChartOptions = {};
  selectedPeriod = 'daily'; // valore predefinito
  customErrorMessage: string = '';
  @Output() addressChange = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private geoService: GeocodingService,
    private weatherService: WeatherService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      address: ['', Validators.required],
      periodSelect: [undefined, Validators.required],
      date: [null],
      week: [null],
      year: [null],
    });

    this.form.get('period')?.valueChanges.subscribe((period) => {
      this.resetDynamicFields();

      if (period === 'daily') {
        this.form.get('date')?.addValidators(Validators.required);
      } else if (period === 'weekly') {
        this.form.get('week')?.addValidators(Validators.required);
      } else if (period === 'yearly') {
        this.form.get('year')?.addValidators(Validators.required);
      }

      this.form.updateValueAndValidity();
    });

    this.form.get('periodSelect')?.valueChanges.subscribe(() => {
      this.form.patchValue({
        date: null,
        week: null,
        year: null,
      });

      this.form.get('date')?.markAsPristine();
      this.form.get('week')?.markAsPristine();
      this.form.get('year')?.markAsPristine();
    });

    // grafico placeholder iniziale
    this.tempChartOptions = {
      title: { text: 'Temperature Data (demo)' },
      series: [],
    };
    this.windChartOptions = {
      title: { text: 'Wind Data (demo)' },
      series: [],
    };
    this.humChartOptions = {
      title: { text: 'Humidity Data (demo)' },
      series: [],
    };
  }

  resetDynamicFields() {
    ['date', 'week', 'year'].forEach((field) => {
      const control = this.form.get(field);
      control?.clearValidators();
      control?.setValue(null);
      control?.updateValueAndValidity({ emitEvent: false });
    });
  }

  async onSubmit() {
    try {
      let startDate = '';
      let endDate = '';
      const address = this.form.value.address;
      const periodSelect = this.form.value.periodSelect;
      const date = this.form.value.date;
      const week = this.form.value.week;
      const year = this.form.value.year;
      if (periodSelect === 'daily' && date) {
        startDate = date;
        endDate = date;
      } else if (periodSelect === 'weekly' && week) {
        let dates = getWeekRange(week);
        startDate = dates?.startDate;
        endDate = dates?.endDate;
      } else if (periodSelect === 'yearly' && year) {
        let dates = getYearRange(year);
        startDate = dates?.startDate;
        endDate = dates?.endDate;
      }
      const coordinatesResponse = await this.getCoordinates(address);
      if (coordinatesResponse) {
        const coords = coordinatesResponse?.geometry;
        const city = coordinatesResponse?.formatted?.split(',');
        city && this.addressChange.emit(`${city}`);
        const data = await this.getWeatherData(coords.lat, coords.lng, startDate, endDate);
        this.setupTempChart(data, coordinatesResponse, periodSelect);
        this.setupWindChart(data, coordinatesResponse, periodSelect);
        this.setupHumChart(data, coordinatesResponse, periodSelect);
        this.customErrorMessage = ''
      } else {
        this.customErrorMessage = 'Indirizzo non valido. Per favore riprova.';
      }
    } catch (error: any) {
      if (error.message === 'NO_RESULTS') {
        this.customErrorMessage = 'Indirizzo non valido. Per favore riprova.';
      } else {
        this.customErrorMessage =
          'Si è verificato un errore durante il recupero dei dati. Per favore riprova.';
      }
    }
  }

  async getCoordinates(address: string): Promise<GeoResult> {
    return this.geoService.getCoordinates(address);
  }

  async getWeatherData(lat: number, lng: number, startDate: string, endDate: string): Promise<any> {
    return this.weatherService.getWeather(lat, lng, startDate, endDate);
  }

  setupTempChart(
    data: { dates: any; temperatures: any; humidity: any; windspeed: any },
    coordinatesResponse: { geometry: { lat: number; lng: number } },
    periodSelect: string
  ) {
    let titleText = `Temperatura - ${
      periodSelect === 'daily'
        ? 'Giornaliero'
        : periodSelect === 'weekly'
        ? 'Settimanale'
        : 'Annuale'
    }`;
    this.tempChartOptions = {
      infoToShow: coordinatesResponse,
      title: { text: titleText },
      xAxis: {
        categories: data.dates,
        labels: {
          step: Math.floor(data.dates.length / 12),
          rotation: -45,
          align: 'right',
          style: {
            fontSize: '11px',
          },
        },
      },
      yAxis: { title: { text: 'Temperatura (°C)' } },
      tooltip: { valueSuffix: '°C' },
      series: [
        {
          name: 'Temperatura (°C)',
          type: 'line',
          data: data.temperatures,
          color: '#ff6600',
        },
      ],
      credits: { enabled: false },
    };
    this.sharedService.tempUpdateData(this.tempChartOptions);
  }

  setupWindChart(
    data: { dates: any; temperatures: any; humidity: any; windspeed: any },
    coordinatesResponse: { geometry: { lat: number; lng: number } },
    periodSelect: string
  ) {
    let titleText = `Velocità del Vento - ${
      periodSelect === 'daily'
        ? 'Giornaliero'
        : periodSelect === 'weekly'
        ? 'Settimanale'
        : 'Annuale'
    }`;
    this.windChartOptions = {
      infoToShow: coordinatesResponse,
      title: { text: titleText },
      xAxis: {
        categories: data.dates,
        labels: {
          step: Math.floor(data.dates.length / 12),
          rotation: -45,
          align: 'right',
          style: { fontSize: '11px' },
        },
      },
      yAxis: {
        title: { text: 'Vento (km/h)' },
      },
      tooltip: { valueSuffix: ' km/h' },
      series: [
        {
          name: 'Vento (km/h)',
          type: 'line',
          data: data.windspeed,
          color: '#3b82f6',
        },
      ],
      credits: { enabled: false },
    };

    this.sharedService.windUpdateData(this.windChartOptions);
  }

  setupHumChart(
    data: { dates: any; temperatures: any; humidity: any; windspeed: any },
    coordinatesResponse: { geometry: { lat: number; lng: number } },
    periodSelect: string
  ) {
    let titleText = `Umidità - ${
      periodSelect === 'daily'
        ? 'Giornaliero'
        : periodSelect === 'weekly'
        ? 'Settimanale'
        : 'Annuale'
    }`;
    this.humChartOptions = {
      infoToShow: coordinatesResponse,
      title: { text: titleText },
      xAxis: {
        categories: data.dates,
        labels: {
          step: Math.floor(data.dates.length / 12),
          rotation: -45,
          align: 'right',
          style: { fontSize: '11px' },
        },
      },
      yAxis: {
        title: { text: 'Umidità (%)' },
      },
      tooltip: { valueSuffix: ' %' },
      series: [
        {
          name: 'Umidità (%)',
          type: 'line',
          data: data.humidity,
          color: '#22c55e',
        },
      ],
      credits: { enabled: false },
    };

    this.sharedService.humUpdateData?.(this.humChartOptions);
  }

  isPeriodValid(): boolean {
    const period = this.form.controls['periodSelect'].value;
    if (period === 'daily') {
      return !!this.form.controls['date'].value;
    } else if (period === 'weekly') {
      return !!this.form.controls['week'].value;
    } else if (period === 'yearly') {
      return !!this.form.controls['year'].value;
    }
    return false;
  }
}
