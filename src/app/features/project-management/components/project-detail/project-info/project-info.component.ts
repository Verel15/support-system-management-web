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
import { ProjectService } from '../../../services/project.service';
import { TicketStatusGroup } from '../../../interfaces/project.interface';
import { pillTooltip } from '../../../../dashboard/utils/chart-tooltip.util';
Chart.register(ArcElement, DoughnutController, Legend, Tooltip, ChartDataLabels);

const STATUS_GROUP_META: Record<TicketStatusGroup, { label: string; color: string }> = {
  START: { label: 'เริ่มต้น', color: '#3b82f6' },
  PROCESS: { label: 'กำลังดำเนินการ', color: '#f97316' },
  SUCCESS: { label: 'สำเร็จ', color: '#22c55e' },
  FAILED: { label: 'ไม่สำเร็จ', color: '#ef4444' },
};
const STATUS_GROUP_ORDER: TicketStatusGroup[] = ['START', 'PROCESS', 'SUCCESS', 'FAILED'];

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
  private readonly projectService = inject(ProjectService);
  protected readonly cardActionMenu = viewChild.required<Menu>('cardActionMenu');
  protected readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  protected readonly documentsVisible = signal(false);
  protected readonly projectDocuments = signal<ProjectDocument[]>([]);
  protected readonly statusGroupCounts = signal<Partial<Record<TicketStatusGroup, number>>>({});

  private chartInstance: Chart<'doughnut'> | null = null;
  private totalForCenter = 0;
  private lastFetchedDocId = '';
  private lastFetchedStatsId = '';

  protected readonly cardMenuItems = computed<MenuItem[]>(() => [
    { label: 'แก้ไขโครงการ', command: () => this.editClick.emit() },
    { separator: true },
    { label: 'ลบ', data: { danger: true }, command: () => this.deleteClick.emit() },
  ]);

  protected readonly chartData = computed(() => {
    const counts = this.statusGroupCounts();
    return STATUS_GROUP_ORDER.map((group) => ({
      label: STATUS_GROUP_META[group].label,
      color: STATUS_GROUP_META[group].color,
      count: counts[group] ?? 0,
    }));
  });

  protected readonly totalTickets = computed(() =>
    this.chartData().reduce((sum, seg) => sum + seg.count, 0),
  );

  constructor() {
    effect(() => {
      const id = this.project().id;
      if (!id || id === this.lastFetchedDocId) return;
      this.lastFetchedDocId = id;
      this.projectService.getDocuments(id).subscribe({
        next: (docs) => {
          this.projectDocuments.set(
            docs.map((d) => ({ id: d.id, name: d.fileName, url: d.fileUrl })),
          );
        },
        error: () => {},
      });
    });

    effect(() => {
      const id = this.project().id;
      if (!id || id === this.lastFetchedStatsId) return;
      this.lastFetchedStatsId = id;
      this.projectService.getTicketStats(id).subscribe({
        next: (stats) => {
          const counts: Partial<Record<TicketStatusGroup, number>> = {};
          for (const g of stats.statusGroups) {
            counts[g.statusGroup] = g.count;
          }
          this.statusGroupCounts.set(counts);
        },
        error: () => {},
      });
    });

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
            enabled: false,
            external: ctx => pillTooltip(ctx),
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
