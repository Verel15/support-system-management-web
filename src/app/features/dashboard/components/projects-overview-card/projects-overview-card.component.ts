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
import { ProjectStatusDistributionResponse } from '../../interfaces/dashboard.interface';

Chart.register(ArcElement, DoughnutController, Tooltip, ChartDataLabels);

interface ProjectSegment {
  label: string;
  count: number;
  pct: number;
  color: string;
}

@Component({
  selector: 'app-projects-overview-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './projects-overview-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsOverviewCardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected readonly yearCtrl = new FormControl<Date | null>(new Date());
  protected readonly data = signal<ProjectStatusDistributionResponse | null>(null);
  protected readonly loading = signal(false);

  protected segments: ProjectSegment[] = [];
  protected total = 0;

  private chartInstance: Chart<'doughnut'> | null = null;
  private chartReady = false;

  constructor() {
    this.yearCtrl.valueChanges.pipe(
      startWith(this.yearCtrl.value),
      switchMap((date) => {
        this.loading.set(true);
        const year = date ? date.getFullYear() : undefined;
        return this.dashboardService.getProjectStatusDistribution(year);
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
      const raw = [
        { label: 'Waiting Project', count: res.waitingCount, color: '#eab308' },
        { label: 'Open Project',    count: res.openCount,    color: '#3b82f6' },
        { label: 'Close Project',   count: res.closeCount,   color: '#94a3b8' },
      ];
      this.total = res.total;
      this.segments = raw.map(d => ({ ...d, pct: this.total ? Math.round((d.count / this.total) * 100) : 0 }));
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
      id: 'centerText',
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
        ctx.fillText(`${total} Projects`, cx, cy - 8);
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
        cutout: '62%',
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
            font: { size: 11, weight: 'bold' },
            formatter: (value: number) => {
              const pct = total ? Math.round((value / total) * 100) : 0;
              return pct >= 10 ? `${pct}%` : '';
            },
          },
        },
      },
    });
  }
}
