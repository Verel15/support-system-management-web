import { ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild } from '@angular/core';
import { Popover } from 'primeng/popover';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import {
  FilterOption,
  PriorityResponse,
  TicketRemainingTime,
  buildPriorityOptions,
  TICKET_TIME_OPTIONS,
} from '../../interfaces/ticket.interface';

export interface TicketFilterState {
  priorityId: string | null;
  remainingTime: TicketRemainingTime | null;
}

@Component({
  selector: 'app-ticket-filter',
  imports: [Popover, Button, Divider],
  templateUrl: './ticket-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketFilterComponent {
  readonly priorities = input<PriorityResponse[]>([]);

  readonly apply = output<TicketFilterState>();

  protected readonly selectedPriorityId = signal<string | null>(null);
  protected readonly selectedRemainingTime = signal<TicketRemainingTime | null>(null);

  private readonly panelRef = viewChild.required<Popover>('panel');

  protected readonly priorityOptions = computed<FilterOption<string>[]>(() =>
    buildPriorityOptions(this.priorities()).slice(1),
  );

  protected readonly timeOptions = TICKET_TIME_OPTIONS.slice(1);

  protected readonly activeCount = computed(
    () => (this.selectedPriorityId() ? 1 : 0) + (this.selectedRemainingTime() ? 1 : 0),
  );

  toggle(event: MouseEvent): void {
    this.panelRef().toggle(event);
  }

  protected selectPriority(value: string | null): void {
    this.selectedPriorityId.set(this.selectedPriorityId() === value ? null : value);
  }

  protected selectRemainingTime(value: TicketRemainingTime | null): void {
    this.selectedRemainingTime.set(this.selectedRemainingTime() === value ? null : value);
  }

  protected isPrioritySelected(value: string | null): boolean {
    return this.selectedPriorityId() === value;
  }

  protected isRemainingTimeSelected(value: TicketRemainingTime | null): boolean {
    return this.selectedRemainingTime() === value;
  }

  protected clear(): void {
    this.selectedPriorityId.set(null);
    this.selectedRemainingTime.set(null);
  }

  protected search(): void {
    this.apply.emit({
      priorityId: this.selectedPriorityId(),
      remainingTime: this.selectedRemainingTime(),
    });
    this.panelRef().hide();
  }
}
