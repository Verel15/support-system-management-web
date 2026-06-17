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

interface TicketSegment {
  label: string;
  count: number;
  pct: number;
  color: string;
}

@Component({
  selector: 'app-tickets-overview-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './tickets-overview-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsOverviewCardComponent {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected readonly monthCtrl = new FormControl<Date | null>(new Date());

  protected readonly segments: TicketSegment[] = (() => {
    const raw = [
      { label: 'Open',       count: 32,  color: '#3b82f6' },
      { label: 'In process', count: 104, color: '#f97316' },
      { label: 'Done',       count: 30,  color: '#22c55e' },
      { label: 'Close',      count: 58,  color: '#94a3b8' },
      { label: 'Return',     count: 5,   color: '#eab308' },
      { label: 'Reject',     count: 1,   color: '#ef4444' },
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
                const pct = Math.round((val / total) * 100);
                return ` ${val} (${pct}%)`;
              },
            },
          },
          datalabels: {
            color: '#ffffff',
            font: { size: 10, weight: 'bold' },
            formatter: (value: number) => {
              const pct = Math.round((value / total) * 100);
              return pct >= 8 ? `${pct}%` : '';
            },
          },
        },
      },
    });
  }
}
