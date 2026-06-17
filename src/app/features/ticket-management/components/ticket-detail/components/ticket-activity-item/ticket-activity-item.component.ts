import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActivityItem } from '../../ticket-detail.types';

@Component({
  selector: 'app-ticket-activity-item',
  imports: [],
  host: { class: 'block' },
  template: `
    <div class="flex items-center justify-between gap-4 px-1 py-0.5" role="log">
      <p class="text-sm text-slate-600 leading-relaxed">
        <span class="font-semibold text-slate-800">{{ activity().actor }}</span>
        {{ ' ' }}{{ activity().action }}{{ ' ' }}
        <span class="font-semibold text-blue-600">{{ activity().statusLabel }}</span>
      </p>
      <time class="text-xs text-slate-400 shrink-0">{{ activity().timestamp }}</time>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketActivityItemComponent {
  readonly activity = input.required<ActivityItem>();
}
