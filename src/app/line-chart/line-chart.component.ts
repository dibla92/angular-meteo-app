import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit, ViewChild } from '@angular/core';
import { HighchartsChartComponent } from 'highcharts-angular';
import { MyChartOptions, SharedService } from '../services/shared.service';
import * as Highcharts from 'highcharts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartComponent],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // 👈 fallback
})
export class LineChartComponent implements OnInit {
  @Input() chartOptions!: MyChartOptions;
  Highcharts: typeof Highcharts = Highcharts;

  constructor() {}

  ngOnInit(): void {}
}
