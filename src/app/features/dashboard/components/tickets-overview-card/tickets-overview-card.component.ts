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
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePicker } from 'primeng/datepicker';
import { switchMap, startWith } from 'rxjs';
import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../../services/dashboard.service';
import { TicketStatusDistributionResponse } from '../../interfaces/dashboard.interface';

Chart.register(ArcElement, DoughnutController, Tooltip, ChartDataLabels);

interface TicketSegment {
  label: string;
  count: number;
  pct: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  Open:       '#3b82f6',
  PROCESS: '#f97316',
  SUCCESS:       '#22c55e',
  FAILED:     '#eab308',
};

const DEFAULT_COLORS = ['#3b82f6', '#f97316', '#22c55e', '#94a3b8', '#eab308', '#ef4444', '#8b5cf6'];

@Component({
  selector: 'app-tickets-overview-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './tickets-overview-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsOverviewCardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected readonly monthCtrl = new FormControl<Date | null>(new Date());
  protected readonly data = signal<TicketStatusDistributionResponse | null>(null);
  protected readonly loading = signal(false);

  protected segments: TicketSegment[] = [];
  protected total = 0;

  private chartInstance: Chart<'doughnut'> | null = null;
  private chartReady = false;

  constructor() {
    this.monthCtrl.valueChanges.pipe(
      startWith(this.monthCtrl.value),
      switchMap((date) => {
        this.loading.set(true);
        const year = date ? date.getFullYear() : undefined;
        const month = date ? date.getMonth() + 1 : undefined;
        return this.dashboardService.getTicketStatusDistribution(year, month);
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
      this.total = res.total;
      this.segments = res.statusCounts.map((sc, i) => ({
        label: sc.group,
        count: sc.count,
        color: STATUS_COLORS[sc.group] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
        pct: this.total ? Math.round((sc.count / this.total) * 100) : 0,
      }));
      this.rebuildChart();
    });

    this.destroyRef.onDestroy(() => this.chartInstance?.destroy());
  }

  private rebuildChart(): void {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;

    this.chartInstance?.destroy();

    const { segments, total } = this;

    const centerTextPlugin = {
      id: 'centerTextTickets',
      afterDraw(chart: Chart): void {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.font = "bold 18px 'IBM Plex Sans Thai', sans-serif";
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${total} Tickets`, cx, cy - 8);
        ctx.font = "11px 'IBM Plex Sans Thai', sans-serif";
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('จำนวนรวมทั้งหมด', cx, cy + 10);
        ctx.restore();
      },
    };

    this.chartInstance = new Chart<'doughnut'>(canvas, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: segments.map(s => s.label),
        datasets: [{
          data: segments.map(s => s.count),
          backgroundColor: segments.map(s => s.color),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4,
        }],
      },
      options: {
        cutout: '60%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.raw as number;
                const pct = total ? Math.round((val / total) * 100) : 0;
                return ` ${val} (${pct}%)`;
              },
            },
          },
          datalabels: {
            color: '#ffffff',
            font: { size: 10, weight: 'bold' },
            formatter: (value: number) => {
              const pct = total ? Math.round((value / total) * 100) : 0;
              return pct >= 8 ? `${pct}%` : '';
            },
          },
        },
      },
    });
  }
}
