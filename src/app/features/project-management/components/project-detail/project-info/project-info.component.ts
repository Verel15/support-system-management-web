import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ProjectDetail } from '../project-detail.types';
import { DocumentsDialogComponent, ProjectDocument } from '../../../../../shared/components/dialogs';

Chart.register(ArcElement, DoughnutController, Legend, Tooltip, ChartDataLabels);

@Component({
  selector: 'app-project-info',
  imports: [Button, Menu, DocumentsDialogComponent],
  templateUrl: './project-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInfoComponent {
  readonly project = input.required<ProjectDetail>();
  readonly readOnly = input(false);
  readonly editClick = output<void>();
  readonly deleteClick = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  protected readonly cardActionMenu = viewChild.required<Menu>('cardActionMenu');
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected readonly documentsVisible = signal(false);
  protected readonly projectDocuments: ProjectDocument[] = [
    { id: '1', name: 'เอกสาร A.pdf', url: '#' },
    { id: '2', name: 'เอกสาร B.pdf', url: '#' },
    { id: '3', name: 'เอกสาร C.pdf', url: '#' },
    { id: '4', name: 'เอกสาร D.pdf', url: '#' },
    { id: '5', name: 'เอกสาร E.pdf', url: '#' },
  ];

  private chartInstance: Chart | null = null;
  private totalForCenter = 0;

  protected readonly cardMenuItems = computed<MenuItem[]>(() => [
    { label: 'แก้ไขโครงการ', command: () => this.editClick.emit() },
    { separator: true },
    { label: 'ลบ', data: { danger: true }, command: () => this.deleteClick.emit() },
  ]);

  protected readonly totalTickets = computed(() => {
    const t = this.project().tickets;
    return t.open + t.inProcess + t.done + t.close + t.return + t.reject;
  });

  protected readonly chartData = computed(() => {
    const t = this.project().tickets;
    return [
      { label: 'Open', count: t.open, color: '#3b82f6' },
      { label: 'In process', count: t.inProcess, color: '#f97316' },
      { label: 'Done', count: t.done, color: '#22c55e' },
      { label: 'Close', count: t.close, color: '#94a3b8' },
      { label: 'Return', count: t.return, color: '#eab308' },
      { label: 'Reject', count: t.reject, color: '#ef4444' },
    ];
  });

  constructor() {
    effect(() => {
      const data = this.chartData();
      this.totalForCenter = this.totalTickets();
      if (this.chartInstance) {
        (this.chartInstance.data.datasets[0].data as number[]) = data.map(d => d.count);
        this.chartInstance.update();
      }
    });

    afterNextRender(() => {
      this.totalForCenter = this.totalTickets();
      this.createChart();
    });

    this.destroyRef.onDestroy(() => this.chartInstance?.destroy());
  }

  private createChart(): void {
    const canvas = this.chartCanvas()?.nativeElement;
    if (!canvas) return;

    const data = this.chartData();
    const self = this;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const centerTextPlugin: any = {
      id: 'centerText',
      afterDraw(chart: Chart): void {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.font = "bold 20px 'IBM Plex Sans Thai', sans-serif";
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${self.totalForCenter} Tickets`, cx, cy - 8);
        ctx.font = "12px 'IBM Plex Sans Thai', sans-serif";
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('จำนวนรวมทั้งหมด', cx, cy + 10);
        ctx.restore();
      },
    };

    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      plugins: [centerTextPlugin],
      data: {
        labels: data.map(d => d.label),
        datasets: [
          {
            data: data.map(d => d.count),
            backgroundColor: data.map(d => d.color),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4,
          },
        ],
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
                const pct = self.totalForCenter
                  ? Math.round((val / self.totalForCenter) * 100)
                  : 0;
                return ` ${val} (${pct}%)`;
              },
            },
          },
          datalabels: {
            color: '#ffffff',
            font: { size: 10, weight: 'bold' },
            formatter: (value: number) => {
              if (!self.totalForCenter || value === 0) return '';
              const pct = Math.round((value / self.totalForCenter) * 100);
              return pct > 0 ? `${pct}%` : '';
            },
          },
        },
      },
    });
  }

  protected onCardMore(event: MouseEvent): void {
    this.cardActionMenu().toggle(event);
  }

  protected openDocuments(): void {
    this.documentsVisible.set(true);
  }
}
