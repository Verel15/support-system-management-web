import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels);

interface ProjectEntry {
  name: string;
  count: number;
}

@Component({
  selector: 'app-top-projects-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './top-projects-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopProjectsCardComponent {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected readonly monthCtrl = new FormControl<Date | null>(new Date());

  protected readonly projects: ProjectEntry[] = [
    { name: 'Helpdesk',              count: 25 },
    { name: 'IT Supporting and He.', count: 22 },
    { name: 'Food Delivery',         count: 18 },
    { name: 'Bank',                  count: 15 },
    { name: 'Saving money',          count: 13 },
  ];

  private chartInstance: Chart<'bar'> | null = null;

  constructor() {
    afterNextRender(() => this.createChart());
    this.destroyRef.onDestroy(() => this.chartInstance?.destroy());
  }

  private createChart(): void {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;

    const { projects } = this;

    this.chartInstance = new Chart<'bar'>(canvas, {
      type: 'bar',
      data: {
        labels: projects.map(p => p.name),
        datasets: [{
          data: projects.map(p => p.count),
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
