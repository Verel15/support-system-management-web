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
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../../services/dashboard.service';
import { TopProjectResponse } from '../../interfaces/dashboard.interface';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels);

@Component({
  selector: 'app-top-projects-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './top-projects-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopProjectsCardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected readonly monthCtrl = new FormControl<Date | null>(new Date());
  protected readonly data = signal<TopProjectResponse | null>(null);
  protected readonly loading = signal(false);

  private chartInstance: Chart<'bar'> | null = null;
  private chartReady = false;

  constructor() {
    this.monthCtrl.valueChanges.pipe(
      startWith(this.monthCtrl.value),
      switchMap((date) => {
        this.loading.set(true);
        const year = date ? date.getFullYear() : undefined;
        const month = date ? date.getMonth() + 1 : undefined;
        return this.dashboardService.getTopProjects(year, month);
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
      this.rebuildChart();
    });

    this.destroyRef.onDestroy(() => this.chartInstance?.destroy());
  }

  private rebuildChart(): void {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;

    this.chartInstance?.destroy();

    const projects = this.data()?.projects ?? [];

    this.chartInstance = new Chart<'bar'>(canvas, {
      type: 'bar',
      data: {
        labels: projects.map(p => p.projectName),
        datasets: [{
          data: projects.map(p => p.ticketCount),
          backgroundColor: '#15803d',
          borderRadius: 4,
          barThickness: 44,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.raw as number} tickets`,
            },
          },
          datalabels: {
            color: '#ffffff',
            anchor: 'end',
            align: 'start',
            font: { size: 13, weight: 'bold' },
            formatter: (value: number) => value,
          },
        },
        scales: {
          x: {
            display: false,
            grid: { display: false },
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              font: { size: 13, family: "'IBM Plex Sans Thai', sans-serif" },
              color: '#475569',
            },
          },
        },
      },
    });
  }
}
