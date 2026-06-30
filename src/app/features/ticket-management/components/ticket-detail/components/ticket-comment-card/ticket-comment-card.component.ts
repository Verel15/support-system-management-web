import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CommentItem } from '../../ticket-detail.types';

@Component({
  selector: 'app-ticket-comment-card',
  imports: [Menu],
  host: { class: 'block' },
  templateUrl: './ticket-comment-card.component.html',
  styles: [`
    .rich-content :is(h1, h2, h3, h4, h5, h6) { font-weight: 600; line-height: 1.3; margin: 0.5em 0; }
    .rich-content h1 { font-size: 1.5rem; }
    .rich-content h2 { font-size: 1.25rem; }
    .rich-content h3 { font-size: 1.125rem; }
    .rich-content p { margin: 0.25em 0; }
    .rich-content strong { font-weight: 700; }
    .rich-content em { font-style: italic; }
    .rich-content ul { list-style: disc; padding-left: 1.25rem; margin: 0.25em 0; }
    .rich-content ol { list-style: decimal; padding-left: 1.25rem; margin: 0.25em 0; }
    .rich-content a { color: var(--p-primary-500); text-decoration: underline; }
    .rich-content blockquote { border-left: 3px solid #cbd5e1; padding-left: 0.75rem; color: #64748b; }
    .rich-content code { background: #f1f5f9; border-radius: 3px; padding: 0.1em 0.3em; font-family: monospace; font-size: 0.875em; }
  `],
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
