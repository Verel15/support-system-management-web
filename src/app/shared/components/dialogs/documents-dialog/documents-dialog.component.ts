import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Dialog } from 'primeng/dialog';

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
}

@Component({
  selector: 'app-documents-dialog',
  imports: [Dialog],
  templateUrl: './documents-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsDialogComponent {
  visible = model(false);
  documents = input<ProjectDocument[]>([]);

  protected close(): void {
    this.visible.set(false);
  }

  protected getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pi pi-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'pi pi-file-word';
    return 'pi pi-file';
  }
}
