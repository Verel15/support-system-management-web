import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, effect, input, output, signal, viewChild } from '@angular/core';
import { FeedItem, CommentItem, ActivityItem } from '../../ticket-detail.types';
import { TicketCommentCardComponent } from '../ticket-comment-card/ticket-comment-card.component';
import { TicketActivityItemComponent } from '../ticket-activity-item/ticket-activity-item.component';
import { TextEditorComponent } from '../../../../../../shared/components/text-editor';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-ticket-comment-feed',
  imports: [TicketCommentCardComponent, TicketActivityItemComponent, TextEditorComponent, Button],
  host: { class: 'flex flex-col border-b border-slate-200 lg:border-b-0 lg:border-r lg:overflow-hidden lg:col-span-8' },
  templateUrl: './ticket-comment-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketCommentFeedComponent implements AfterViewInit {
  readonly items = input.required<FeedItem[]>();
  readonly submitting = input(false);
  readonly commentSubmit = output<string>();

  protected readonly commentText = signal('');
  private readonly feedEl = viewChild<ElementRef<HTMLDivElement>>('feedScroll');

  constructor() {
    effect(() => {
      this.items();
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    const el = this.feedEl()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  protected asComment(item: FeedItem): CommentItem {
    return item as CommentItem;
  }

  protected asActivity(item: FeedItem): ActivityItem {
    return item as ActivityItem;
  }

  protected onSubmit(): void {
    const text = this.commentText().trim();
    if (!text) return;
    this.commentSubmit.emit(text);
    this.commentText.set('');
  }
}
