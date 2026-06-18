import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip);

interface TicketLineSeries {
  label: string;
  color: string;
  total: number;
  data: number[];
}

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

@Component({
  selector: 'app-ticket-open-chart-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './ticket-open-chart-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketOpenChartCardComponent {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  protected readonly yearCtrl = new FormControl<Date | null>(new Date());

  protected readonly series: TicketLineSeries[] = [
    {
      label: 'Open Tickets',
      color: '#3b82f6',
      total: 150,
      data: [10, 20, 5, 4, 4, 1, 30, 10, 15, 8, 25, 5],
    },
    {
      label: 'Success Tickets',
      color: '#22c55e',
      total: 115,
      data: [5, 19, 2, 3, 4, 1, 20, 8, 5, 7, 21, 3],
    },
    {
      label: 'Over due Tickets',
      color: '#ef4444',
      total: 35,
      data: [4, 4, 1, 2, 2, 1, 10, 2, 1, 2, 2, 1],
    },
  ];

  private chartInstance: Chart<'line'> | null = null;

  constructor() {
    afterNextRender(() => this.createChart());
    this.destroyRef.onDestroy(() => this.chartInstance?.destroy());
  }

  private createChart(): void {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;

    this.chartInstance = new Chart<'line'>(canvas, {
      type: 'line',
      data: {
        labels: THAI_MONTHS,
        datasets: this.series.map((s) => ({
          label: s.label,
          data: s.data,
          borderColor: s.color,
          backgroundColor: s.color,
          pointBackgroundColor: s.color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          tension: 0,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          datalabels: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            usePointStyle: true,
            callbacks: {
              title: (items) => items[0]?.label ?? '',
              label: (ctx) => `  ${ctx.dataset.label}: ${ctx.raw}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { size: 11, family: "'IBM Plex Sans Thai', sans-serif" },
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            border: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { size: 11, family: "'IBM Plex Sans Thai', sans-serif" },
              stepSize: 5,
            },
          },
        },
      },
    });
  }
}
