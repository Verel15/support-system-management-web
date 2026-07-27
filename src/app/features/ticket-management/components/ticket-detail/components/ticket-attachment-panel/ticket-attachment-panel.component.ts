import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ApiService } from '../../../../../../core/services/api.service';
import { TicketAttachmentResponse } from '../../../../interfaces/ticket.interface';

@Component({
  selector: 'app-ticket-attachment-panel',
  templateUrl: './ticket-attachment-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketAttachmentPanelComponent {
  private readonly api = inject(ApiService);

  readonly attachments = input.required<TicketAttachmentResponse[]>();

  protected readonly downloadingId = signal<string | null>(null);

  protected getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pi-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'pi-file-word';
    if (['png', 'jpg', 'jpeg'].includes(ext)) return 'pi-image';
    return 'pi-file';
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
