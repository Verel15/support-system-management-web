import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { NotificationItem } from '../../interfaces/notification.interface';

@Component({
  selector: 'app-notification-item',
  imports: [Avatar, Tag],
  templateUrl: './notification-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationItemComponent {
  readonly notification = input.required<NotificationItem>();
  readonly clicked = output<string>();

  protected onClick(): void {
    this.clicked.emit(this.notification().id);
  }
}
