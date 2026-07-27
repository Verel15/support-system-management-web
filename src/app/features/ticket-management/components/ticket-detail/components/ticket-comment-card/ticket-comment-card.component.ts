import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CommentItem } from '../../interfaces/ticket-detail.types';
import { ApiService } from '../../../../../../core/services/api.service';
import { TicketAttachmentResponse } from '../../../../interfaces/ticket.interface';
import { FilePreviewLightboxComponent, FilePreviewItem } from '../../../../../../shared/components/file-preview-lightbox';

@Component({
  selector: 'app-ticket-comment-card',
  imports: [Menu, FilePreviewLightboxComponent],
  host: { class: 'block' },
  templateUrl: './ticket-comment-card.component.html',
  styles: [
    `
      .rich-content :is(h1, h2, h3, h4, h5, h6) {
        font-weight: 600;
        line-height: 1.3;
        margin: 0.5em 0;
      }
      .rich-content h1 {
        font-size: 1.5rem;
      }
      .rich-content h2 {
        font-size: 1.25rem;
      }
      .rich-content h3 {
        font-size: 1.125rem;
      }
      .rich-content p {
        margin: 0.25em 0;
      }
      .rich-content strong {
        font-weight: 700;
      }
      .rich-content em {
        font-style: italic;
      }
      .rich-content ul {
        list-style: disc;
        padding-left: 1.25rem;
        margin: 0.25em 0;
      }
      .rich-content ol {
        list-style: decimal;
        padding-left: 1.25rem;
        margin: 0.25em 0;
      }
      .rich-content a {
        color: var(--p-primary-500);
        text-decoration: underline;
      }
      .rich-content blockquote {
        border-left: 3px solid #cbd5e1;
        padding-left: 0.75rem;
        color: #64748b;
      }
      .rich-content code {
        background: #f1f5f9;
        border-radius: 3px;
        padding: 0.1em 0.3em;
        font-family: monospace;
        font-size: 0.875em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketCommentCardComponent {
  private readonly menu = viewChild.required<Menu>('menu');
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly comment = input.required<CommentItem>();

  protected readonly menuItems: MenuItem[] = [{ label: 'แก้ไข' }, { label: 'ลบ' }];
  protected readonly downloadingId = signal<string | null>(null);
  protected readonly previewIndex = signal<number | null>(null);
  protected readonly imageUrls = signal<Record<string, string>>({});

  protected readonly previewFiles = computed<FilePreviewItem[]>(() => {
    const urls = this.imageUrls();
    return this.comment().attachments.map((attachment) => ({
      id: attachment.id,
      name: attachment.fileName,
      url: urls[attachment.id] ?? attachment.fileUrl,
      isImage: this.isImage(attachment),
    }));
  });

  constructor() {
    effect((onCleanup) => {
      const attachments = this.comment().attachments.filter((a) => this.isImage(a));
      const loadedUrls: string[] = [];

      for (const attachment of attachments) {
        this.api.downloadBlob(attachment.fileUrl).subscribe((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          loadedUrls.push(objectUrl);
          this.imageUrls.update((current) => ({ ...current, [attachment.id]: objectUrl }));
        });
      }

      onCleanup(() => {
        for (const url of loadedUrls) URL.revokeObjectURL(url);
      });
    });

    this.destroyRef.onDestroy(() => {
      for (const url of Object.values(this.imageUrls())) URL.revokeObjectURL(url);
    });
  }

  protected imageUrlFor(attachment: TicketAttachmentResponse): string | null {
    return this.imageUrls()[attachment.id] ?? null;
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pi-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'pi-file-word';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return 'pi-image';
    return 'pi-file';
  }

  protected isImage(attachment: TicketAttachmentResponse): boolean {
    return attachment.contentType.startsWith('image/');
  }

  protected openPreview(index: number): void {
    this.previewIndex.set(index);
  }

  protected closePreview(): void {
    this.previewIndex.set(null);
  }

  protected download(attachment: TicketAttachmentResponse): void {
    if (this.downloadingId()) return;
    this.downloadingId.set(attachment.id);
    this.api.downloadBlob(attachment.fileUrl).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = attachment.fileName;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
        this.downloadingId.set(null);
      },
      error: () => this.downloadingId.set(null),
    });
  }
}
