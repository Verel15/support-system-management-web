import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { ExistingFile, UploadedFile } from './file-upload.types';

@Component({
  selector: 'app-file-upload',
  imports: [Button, ProgressBar],
  templateUrl: './file-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent implements OnDestroy {
  accept = input('.png,.jpg,.jpeg,.pdf,video/*');
  multiple = input(true);
  maxSizeMb = input(500);
  subtitle = input<string | null>(null);
  existingFiles = input<ExistingFile[]>([]);

  filesChange = output<File[]>();
  existingFileRemoved = output<string>();

  protected readonly files = signal<UploadedFile[]>([]);
  protected readonly isDragging = signal(false);

  protected readonly displaySubtitle = computed(
    () =>
      this.subtitle() ??
      `รองรับไฟล์ PNG, JPG, PDF หรือไฟล์วิดีโอ (สูงสุด ${this.maxSizeMb()}MB)`
  );

  private readonly messageService = inject(MessageService);
  private readonly intervals = new Map<string, ReturnType<typeof setInterval>>();

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) this.addFiles(Array.from(files));
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  protected onRemoveExistingFile(id: string): void {
    this.existingFileRemoved.emit(id);
  }

  protected removeFile(id: string): void {
    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }
    this.files.update(files => files.filter(f => f.id !== id));
    this.emitFiles();
  }

  protected getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'pi-video';
    if (ext === 'pdf') return 'pi-file-pdf';
    return 'pi-file';
  }

  protected getStatusLabel(status: UploadedFile['status']): string {
    const labels: Record<UploadedFile['status'], string> = {
      uploading: 'กำลังอัปโหลด...',
      complete: 'เสร็จสมบูรณ์',
      error: 'เกิดข้อผิดพลาด',
    };
    return labels[status];
  }

  protected formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private addFiles(files: File[]): void {
    const maxBytes = this.maxSizeMb() * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxBytes) {
        this.messageService.add({
          severity: 'error',
          summary: 'ไฟล์ใหญ่เกินไป',
          detail: `${file.name} มีขนาดเกิน ${this.maxSizeMb()}MB`,
          life: 4000,
        });
        continue;
      }
      const id = crypto.randomUUID();
      this.files.update(f => [
        ...f,
        { id, file, name: file.name, size: file.size, progress: 0, status: 'uploading' },
      ]);
      this.loadPreview(id, file);
      this.simulateProgress(id);
    }
    this.emitFiles();
  }

  private loadPreview(id: string, file: File): void {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const preview = e.target?.result as string;
      this.files.update(files => files.map(f => (f.id === id ? { ...f, preview } : f)));
    };
    reader.readAsDataURL(file);
  }

  private simulateProgress(id: string): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 15, 100);
      this.files.update(files =>
        files.map(f =>
          f.id === id
            ? { ...f, progress, status: progress >= 100 ? 'complete' : 'uploading' }
            : f
        )
      );
      if (progress >= 100) {
        clearInterval(interval);
        this.intervals.delete(id);
      }
    }, 40);
    this.intervals.set(id, interval);
  }

  private emitFiles(): void {
    this.filesChange.emit(this.files().map(f => f.file));
  }

  ngOnDestroy(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
  }
}
