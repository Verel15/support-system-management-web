import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

interface TicketsSummary {
  avgOpen: number;
  openTrend: 'up' | 'down';
  avgOverdue: number;
  overdueTrend: 'up' | 'down';
  avgClosed: number;
  closedTrend: 'up' | 'down';
}

@Component({
  selector: 'app-tickets-summary-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './tickets-summary-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsSummaryCardComponent {
  protected readonly yearCtrl = new FormControl<Date | null>(new Date());

  protected readonly summary = signal<TicketsSummary>({
    avgOpen: 13,
    openTrend: 'up',
    avgOverdue: 3,
    overdueTrend: 'down',
    avgClosed: 10,
    closedTrend: 'up',
  });
}
