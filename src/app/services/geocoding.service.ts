import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private apiKey = '4397dca3af544e9faf6deebcb210074d';

  constructor(private http: HttpClient) {}

  async getCoordinates(address: string): Promise<{ geometry: { lat: number; lng: number } }> {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${this.apiKey}`;
    const res: any = await firstValueFrom(this.http.get(url));
    if (res.results.length === 0) throw new Error('Address not found');
    const response = res.results[0];
    return response;
  }
}
