import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ActivityItem } from '../../ticket-detail.types';

@Component({
  selector: 'app-ticket-activity-item',
  imports: [],
  host: { class: 'block' },
  templateUrl: './ticket-activity-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketActivityItemComponent {
  readonly activity = input.required<ActivityItem>();
}
