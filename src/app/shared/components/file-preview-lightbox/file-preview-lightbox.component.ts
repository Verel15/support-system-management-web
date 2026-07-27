import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface FilePreviewItem {
  id: string;
  name: string;
  url: string;
  isImage: boolean;
}

@Component({
  selector: 'app-file-preview-lightbox',
  templateUrl: './file-preview-lightbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
    '(document:keydown.arrowLeft)': 'showPrev()',
    '(document:keydown.arrowRight)': 'showNext()',
  },
})
export class FilePreviewLightboxComponent {
  readonly files = input<FilePreviewItem[]>([]);
  readonly activeIndex = input<number | null>(null);

  readonly indexChange = output<number>();
  readonly closed = output<void>();

  protected readonly activeFile = computed(() => {
    const index = this.activeIndex();
    return index === null ? null : (this.files()[index] ?? null);
  });

  protected close(): void {
    this.closed.emit();
  }

  protected showAt(index: number): void {
    this.indexChange.emit(index);
  }

  protected showPrev(): void {
    const index = this.activeIndex();
    if (index === null) return;
    const count = this.files().length;
    this.indexChange.emit((index - 1 + count) % count);
  }

  protected showNext(): void {
    const index = this.activeIndex();
    if (index === null) return;
    const count = this.files().length;
    this.indexChange.emit((index + 1) % count);
  }

  protected getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pi-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'pi-file-word';
    return 'pi-file';
  }
}
