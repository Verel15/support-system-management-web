import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CommentItem } from '../../ticket-detail.types';

@Component({
  selector: 'app-ticket-comment-card',
  imports: [Menu],
  host: { class: 'block' },
  templateUrl: './ticket-comment-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketCommentCardComponent {
  private readonly menu = viewChild.required<Menu>('menu');

  readonly comment = input.required<CommentItem>();

  protected readonly menuItems: MenuItem[] = [
    { label: 'แก้ไข' },
    { label: 'ลบ'},
  ];

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }
}
