import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, catchError, map, of, startWith, switchMap } from 'rxjs';
import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, Tooltip } from 'chart.js';
import { DatePicker } from 'primeng/datepicker';
import { format, subDays } from 'date-fns';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLogAction, AuditLogModule, AuditLogTrendResponse } from '../../interfaces/audit-log.interface';
import { formatDateShort } from '../../../../shared/utils/date-format.util';
import { pillTooltip } from '../../../dashboard/utils/chart-tooltip.util';

Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip);

const TREND_DAYS = 14;
const TREND_COLOR = '#22c55e';

@Component({
  selector: 'app-audit-log-trend-chart',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './audit-log-trend-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogTrendChartComponent {
  private readonly auditLogService = inject(AuditLogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly module = input<AuditLogModule | null>(null);
  readonly action = input<AuditLogAction | null>(null);

  protected readonly rangeCtrl = new FormControl<Date[] | null>([
    subDays(new Date(), TREND_DAYS - 1),
    new Date(),
  ]);

  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  protected readonly loading = signal(false);
  protected readonly totalCount = signal(0);
  protected readonly trendData = signal<AuditLogTrendResponse | null>(null);

  private labels: string[] = [];
  private counts: number[] = [];
  private chartInstance: Chart<'line'> | null = null;
  private chartReady = false;

  private readonly query = computed(() => ({
    module: this.module(),
    action: this.action(),
  }));

  constructor() {
    afterNextRender(() => {
      this.chartReady = true;
      if (this.trendData()) this.rebuildChart();
    });

    const range$ = this.rangeCtrl.valueChanges.pipe(startWith(this.rangeCtrl.value));

    combineLatest([toObservable(this.query), range$])
      .pipe(
        switchMap(([q, range]) => {
          const [from, to] = range ?? [];
          if (!from || !to) return of({ res: null as AuditLogTrendResponse | null, loading: false });

          const dateFrom = format(from, 'yyyy-MM-dd');
          const dateTo = format(to, 'yyyy-MM-dd');
          return this.auditLogService.getTrend({ ...q, dateFrom, dateTo }).pipe(
            map((res) => ({ res, loading: false })),
            startWith({ res: null as AuditLogTrendResponse | null, loading: true }),
            catchError(() => of({ res: null as AuditLogTrendResponse | null, loading: false })),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ res, loading }) => {
        this.loading.set(loading);
        if (res) this.trendData.set(res);
      });

    effect(() => {
      const res = this.trendData();
      if (!res || !this.chartReady) return;
      this.labels = res.days.map((d) => formatDateShort(d.date));
      this.counts = res.days.map((d) => d.count);
      this.totalCount.set(res.total);
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
        labels: this.labels,
        datasets: [
          {
            label: 'จำนวน Audit Log',
            data: this.counts,
            borderColor: TREND_COLOR,
            backgroundColor: TREND_COLOR,
            pointBackgroundColor: TREND_COLOR,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0.3,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            external: (ctx) => pillTooltip(ctx),
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
            // ticks: {
            //   color: '#94a3b8',
            //   font: { size: 11, family: "'IBM Plex Sans Thai', sans-serif" },
            //   precision: 0,
            // },
          },
        },
      },
    });
  }
}
