import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePicker } from 'primeng/datepicker';
import { switchMap, startWith } from 'rxjs';
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { TicketTrendResponse } from '../../interfaces/dashboard.interface';

Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip);

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

interface LineSeries {
  label: string;
  color: string;
  total: number;
  data: number[];
}

@Component({
  selector: 'app-ticket-open-chart-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './ticket-open-chart-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketOpenChartCardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  protected readonly yearCtrl = new FormControl<Date | null>(new Date());

  protected readonly data = signal<TicketTrendResponse | null>(null);
  protected readonly loading = signal(false);
  protected series: LineSeries[] = [];

  private chartInstance: Chart<'line'> | null = null;
  private chartReady = false;

  constructor() {
    this.yearCtrl.valueChanges.pipe(
      startWith(this.yearCtrl.value),
      switchMap((date) => {
        this.loading.set(true);
        const year = date ? date.getFullYear() : undefined;
        return this.dashboardService.getTicketTrend(year);
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    afterNextRender(() => {
      this.chartReady = true;
      if (this.data()) this.rebuildChart();
    });

    effect(() => {
      const res = this.data();
      if (!res || !this.chartReady) return;
      const monthly = Array.from({ length: 12 }, (_, i) => {
        const m = res.monthly.find(d => d.month === i + 1);
        return m ?? { month: i + 1, openCount: 0, successCount: 0, overdueCount: 0 };
      });
      this.series = [
        { label: 'Open Tickets',    color: '#3b82f6', total: res.totalOpen,    data: monthly.map(m => m.openCount) },
        { label: 'Success Tickets', color: '#22c55e', total: res.totalSuccess, data: monthly.map(m => m.successCount) },
        { label: 'Over due Tickets',color: '#ef4444', total: res.totalOverdue, data: monthly.map(m => m.overdueCount) },
      ];
      this.rebuildChart();
    });

    this.destroyRef.onDestroy(() => this.chartInstance?.destroy());
  }

  private rebuildChart(): void {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;

    this.chartInstance?.destroy();

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
          datalabels: { display: false },
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
