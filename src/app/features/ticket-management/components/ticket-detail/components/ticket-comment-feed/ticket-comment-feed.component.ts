import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FeedItem, CommentItem, ActivityItem } from '../../interfaces/ticket-detail.types';
import { TicketCommentCardComponent } from '../ticket-comment-card/ticket-comment-card.component';
import { TicketActivityItemComponent } from '../ticket-activity-item/ticket-activity-item.component';
import { EditorFilePreview, TextEditorComponent } from '../../../../../../shared/components/text-editor';
import {
  TICKET_ATTACHMENT_ACCEPT,
  TICKET_ATTACHMENT_MAX_SIZE_MB,
} from '../../../../interfaces/ticket.interface';

export interface CommentSubmit {
  content: string;
  files: File[];
}

interface StagedFile {
  id: string;
  file: File;
  url: string;
}

@Component({
  selector: 'app-ticket-comment-feed',
  imports: [TicketCommentCardComponent, TicketActivityItemComponent, TextEditorComponent, Button],
  host: { class: 'flex flex-col lg:overflow-hidden lg:col-span-8' },
  templateUrl: './ticket-comment-feed.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketCommentFeedComponent implements AfterViewInit {
  private readonly messageService = inject(MessageService);

  readonly items = input.required<FeedItem[]>();
  readonly submitting = input(false);
  readonly commentSubmit = output<CommentSubmit>();

  protected readonly commentText = signal('');
  protected readonly attachmentAccept = TICKET_ATTACHMENT_ACCEPT;
  protected readonly stagedFiles = signal<StagedFile[]>([]);

  protected readonly filePreviews = signal<EditorFilePreview[]>([]);

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

  protected onFilesSelected(files: File[]): void {
    const maxBytes = TICKET_ATTACHMENT_MAX_SIZE_MB * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxBytes) {
        this.messageService.add({
          severity: 'error',
          summary: 'ไฟล์ใหญ่เกินไป',
          detail: `${file.name} มีขนาดเกิน ${TICKET_ATTACHMENT_MAX_SIZE_MB}MB`,
          life: 4000,
        });
        continue;
      }
      const id = crypto.randomUUID();
      const url = URL.createObjectURL(file);
      this.stagedFiles.update((current) => [...current, { id, file, url }]);
      this.syncPreviews();
    }
  }

  protected onRemoveFile(id: string): void {
    const removed = this.stagedFiles().find((f) => f.id === id);
    if (removed) URL.revokeObjectURL(removed.url);
    this.stagedFiles.update((current) => current.filter((f) => f.id !== id));
    this.syncPreviews();
  }

  private syncPreviews(): void {
    this.filePreviews.set(
      this.stagedFiles().map((f) => ({
        id: f.id,
        name: f.file.name,
        url: f.url,
        isImage: f.file.type.startsWith('image/'),
      })),
    );
  }

  protected onSubmit(): void {
    const text = this.commentText().trim();
    if (!text) return;
    this.commentSubmit.emit({
      content: text,
      files: this.stagedFiles().map((f) => f.file),
    });
    for (const f of this.stagedFiles()) URL.revokeObjectURL(f.url);
    this.commentText.set('');
    this.stagedFiles.set([]);
    this.filePreviews.set([]);
  }
}
