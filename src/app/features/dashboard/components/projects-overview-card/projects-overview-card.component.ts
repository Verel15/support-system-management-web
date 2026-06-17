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
import { ArcElement, Chart, DoughnutController, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

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
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected readonly yearCtrl = new FormControl<Date | null>(new Date());

  protected readonly segments: ProjectSegment[] = (() => {
    const raw = [
      { label: 'Waiting Project', count: 14, color: '#eab308' },
      { label: 'Open Project',    count: 15, color: '#3b82f6' },
      { label: 'Close Project',   count: 4,  color: '#94a3b8' },
    ];
    const total = raw.reduce((s, d) => s + d.count, 0);
    return raw.map(d => ({ ...d, pct: Math.round((d.count / total) * 100) }));
  })();

  protected readonly total = this.segments.reduce((s, d) => s + d.count, 0);

  private chartInstance: Chart<'doughnut'> | null = null;

  constructor() {
    afterNextRender(() => this.createChart());
    this.destroyRef.onDestroy(() => this.chartInstance?.destroy());
  }

  private createChart(): void {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;

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
                const pct = Math.round((val / total) * 100);
                return ` ${val} (${pct}%)`;
              },
            },
          },
          datalabels: {
            color: '#ffffff',
            font: { size: 11, weight: 'bold' },
            formatter: (value: number) => {
              const pct = Math.round((value / total) * 100);
              return pct >= 10 ? `${pct}%` : '';
            },
          },
        },
      },
    });
  }
}
