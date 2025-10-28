import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface GeoResult {
  annotations: {
    DMS: {
      lat: string;
      lng: string;
    };
    MGRS: string;
    maidenhead: string;
    mercator: {
      x: number;
      y: number;
    };
    OSM?: {
      edit_url?: string;
      note_url?: string;
      url?: string;
    };
    callingcode?: number;
    currency?: {
      iso_code: string;
      name: string;
      symbol: string;
    };
    flag?: string;
    geohash?: string;
    qibla?: number;
    timezone?: {
      name: string;
      offset_DST: string;
      offset_string: string;
      short_name: string;
    };
    what3words?: {
      words: string;
    };
  };
  bounds: {
    northeast: {
      lat: number;
      lng: number;
    };
    southwest: {
      lat: number;
      lng: number;
    };
  };
  components: {
    ISO_3166_1_alpha_2: string;
    ISO_3166_1_alpha_3: string;
    _category: string;
    _type?: string;
    city?: string;
    state?: string;
    country?: string;
    country_code?: string;
    continent?: string;
  };
  confidence: number;
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

export interface GeoResponse {
  results: GeoResult[];
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private apiKey = '4397dca3af544e9faf6deebcb210074d';

  constructor(private http: HttpClient) {}

  async getCoordinates(address: string): Promise<GeoResult> {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address
    )}&key=${this.apiKey}`;
    const res: GeoResponse = await firstValueFrom(this.http.get<GeoResponse>(url));
    if (res.results.length === 0) throw new Error('NO_RESULTS');
    const response = res.results[0];
    return response;
  }
}
