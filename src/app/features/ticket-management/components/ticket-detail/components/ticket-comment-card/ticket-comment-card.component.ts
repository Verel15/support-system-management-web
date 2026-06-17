import { ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CommentItem } from '../../ticket-detail.types';

@Component({
  selector: 'app-ticket-comment-card',
  imports: [Menu],
  host: { class: 'block' },
  template: `
    <article class="bg-white rounded-xl border border-slate-200 p-4">
      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 select-none"
          [style.background-color]="comment().author.avatarColor"
          aria-hidden="true"
        >{{ comment().author.avatarInitial }}</div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ comment().author.name }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ comment().timestamp }}</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="ตัวเลือกเพิ่มเติม"
              (click)="onMenuOpen($event)"
            >
              <i class="pi pi-ellipsis-h text-sm" aria-hidden="true"></i>
            </button>
          </div>
          <p class="mt-3 text-sm text-slate-700 leading-relaxed">{{ comment().content }}</p>
        </div>
      </div>
    </article>

    <p-menu #menu [model]="menuItems" [popup]="true" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketCommentCardComponent {
  private readonly menu = viewChild.required<Menu>('menu');

  readonly comment = input.required<CommentItem>();

  protected readonly menuItems: MenuItem[] = [
    { label: 'แก้ไข', icon: 'pi pi-pencil' },
    { label: 'ลบ', icon: 'pi pi-trash' },
  ];

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }
}
