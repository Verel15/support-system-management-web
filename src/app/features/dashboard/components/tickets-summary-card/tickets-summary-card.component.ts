import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePicker } from 'primeng/datepicker';
import { switchMap, startWith } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { TicketSummaryResponse } from '../../interfaces/dashboard.interface';

@Component({
  selector: 'app-tickets-summary-card',
  imports: [ReactiveFormsModule, DatePicker],
  templateUrl: './tickets-summary-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketsSummaryCardComponent {
  private readonly dashboardService = inject(DashboardService);

  protected readonly yearCtrl = new FormControl<Date | null>(new Date());
  protected readonly summary = signal<TicketSummaryResponse | null>(null);
  protected readonly loading = signal(false);

  constructor() {
    this.yearCtrl.valueChanges.pipe(
      startWith(this.yearCtrl.value),
      switchMap((date) => {
        this.loading.set(true);
        const year = date ? date.getFullYear() : undefined;
        return this.dashboardService.getTicketSummary(year);
      }),
      takeUntilDestroyed(),
    ).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
