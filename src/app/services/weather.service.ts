import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  constructor(private http: HttpClient) {}

  async getLastYearWeather(
    lat: number,
    lng: number,
    startDate: string,
    endDate: string
  ): Promise<any> {
    let start = this.getLastYearDate();
    let end = this.getTodayDate();
    if (startDate && endDate) {
      start = this.getStartDate(startDate);
      end = this.getEndDate(endDate);
    }
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${start}&end_date=${end}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=auto`;
    const res: any = await firstValueFrom(this.http.get(url));

    // Ricava le date uniche
    const dates = Array.from(new Set(res.hourly.time.map((t: string) => t.split('T')[0])));

    // Aggrega i dati giornalieri
    const temperatures = dates.map((date) => {
      const temps = res.hourly.temperature_2m.filter((v: number, i: number) =>
        res.hourly.time[i].startsWith(date)
      );
      return Math.max(...temps);
    });

    const humidity = dates.map((date) => {
      const hum = res.hourly.relativehumidity_2m.filter((v: number, i: number) =>
        res.hourly.time[i].startsWith(date)
      );
      return Math.max(...hum); 
    });

    const windspeed = dates.map((date) => {
      const wind = res.hourly.windspeed_10m.filter((v: number, i: number) =>
        res.hourly.time[i].startsWith(date)
      );
      return Math.max(...wind);
    });

    return { dates, temperatures, humidity, windspeed };
  }

  private getLastYearDate(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getEndDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private getStartDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }
}
