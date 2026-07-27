import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Editor } from 'primeng/editor';
import { FilePreviewLightboxComponent } from '../file-preview-lightbox';

export interface EditorFilePreview {
  id: string;
  name: string;
  url: string;
  isImage: boolean;
}

@Component({
  selector: 'app-text-editor',
  imports: [FormsModule, Editor, FilePreviewLightboxComponent],
  templateUrl: './text-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextEditorComponent {
  readonly value = model('');
  readonly placeholder = input('รายละเอียด');
  readonly minHeight = input('180px');
  readonly showAttach = input(false);
  readonly attachAccept = input('*');
  readonly filePreviews = input<EditorFilePreview[]>([]);

  readonly filesSelected = output<File[]>();
  readonly filePreviewRemoved = output<string>();

  protected readonly previewIndex = signal<number | null>(null);

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (files.length > 0) this.filesSelected.emit(files);
  }

  protected onRemovePreview(id: string): void {
    this.filePreviewRemoved.emit(id);
  }

  protected openPreview(index: number): void {
    this.previewIndex.set(index);
  }

  protected closePreview(): void {
    this.previewIndex.set(null);
  }

  protected getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'pi-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'pi-file-word';
    return 'pi-file';
  }
}
