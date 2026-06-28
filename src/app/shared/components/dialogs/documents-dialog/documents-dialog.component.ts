import { ChangeDetectionStrategy, Component, inject, input, model, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { ApiService } from '../../../../core/services/api.service';

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
}

@Component({
  selector: 'app-documents-dialog',
  imports: [Dialog, Button],
  templateUrl: './documents-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsDialogComponent {
  private readonly api = inject(ApiService);

  visible = model(false);
  documents = input<ProjectDocument[]>([]);

  protected readonly downloadingId = signal<string | null>(null);

  protected close(): void {
    this.visible.set(false);
  }

  protected getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pi pi-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'pi pi-file-word';
    return 'pi pi-file';
  }

  protected download(doc: ProjectDocument): void {
    if (this.downloadingId()) return;
    this.downloadingId.set(doc.id);
    this.api.downloadBlob(doc.url).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = doc.name;
        anchor.click();
        URL.revokeObjectURL(objectUrl);
        this.downloadingId.set(null);
      },
      error: () => this.downloadingId.set(null),
    });
  }
}
