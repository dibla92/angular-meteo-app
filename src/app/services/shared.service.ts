// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import * as Highcharts from 'highcharts';

export interface MyChartOptions extends Highcharts.Options {
  infoToShow?: any; // puoi tipizzare meglio se sai la struttura di coordinatesResponse
}

@Injectable({ providedIn: 'root' })
export class SharedService {
  private humDataSource = new BehaviorSubject<MyChartOptions>({});
  humCurrentData = this.humDataSource.asObservable();

  private windDataSource = new BehaviorSubject<MyChartOptions>({});
  windCurrentData = this.windDataSource.asObservable();

  private tempDataSource = new BehaviorSubject<MyChartOptions>({});
  tempCurrentData = this.tempDataSource.asObservable();

  tempUpdateData(data: MyChartOptions) {
    this.tempDataSource.next(data);
  }

  windUpdateData(data: MyChartOptions) {
    this.windDataSource.next(data);
  }

  humUpdateData(data: MyChartOptions) {
    this.humDataSource.next(data);
  }
}
