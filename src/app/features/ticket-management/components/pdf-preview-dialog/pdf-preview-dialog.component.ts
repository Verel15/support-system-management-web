import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-pdf-preview-dialog',
  imports: [Button, Dialog],
  templateUrl: './pdf-preview-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfPreviewDialogComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly visible = input.required<boolean>();
  readonly pdfUrl = input<string | null>(null);
  readonly downloading = input(false);

  readonly download = output<void>();
  readonly cancelled = output<void>();

  protected safePdfUrl(): SafeResourceUrl | null {
    const url = this.pdfUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected onDownload(): void {
    this.download.emit();
  }
}
