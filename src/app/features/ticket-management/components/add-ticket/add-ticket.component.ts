import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { EditorFilePreview, TextEditorComponent } from '../../../../shared/components/text-editor';
import { TicketTypeDialogComponent } from '../ticket-type-dialog/ticket-type-dialog.component';
import { SelectedTicketType } from '../ticket-type-dialog/ticket-type-dialog.types';
import { ConfirmDialogComponent } from '../../../../shared/components/dialogs';
import { CanDeactivateComponent } from '../../../../core/guards/unsaved-changes.guard';
import { TicketService } from '../../services/ticket.service';
import { ProjectService } from '../../../project-management/services/project.service';
import {
  TICKET_ATTACHMENT_ACCEPT,
  TICKET_ATTACHMENT_MAX_SIZE_MB,
} from '../../interfaces/ticket.interface';

interface ProjectOption {
  label: string;
  value: string;
}

interface StagedFile {
  id: string;
  file: File;
  url: string;
}

@Component({
  selector: 'app-add-ticket',
  imports: [
    FormsModule,
    Button,
    InputText,
    Select,
    TextEditorComponent,
    TicketTypeDialogComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './add-ticket.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTicketComponent implements CanDeactivateComponent, OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly ticketService = inject(TicketService);
  private readonly projectService = inject(ProjectService);
  private readonly leaveSubject = new Subject<boolean>();

  protected readonly title = signal('');
  protected readonly selectedProjectId = signal<string | null>(null);
  protected readonly selectedTicketType = signal<SelectedTicketType | null>(null);
  protected readonly description = signal('');
  protected readonly showTicketTypeDialog = signal(false);
  protected readonly showLeaveDialog = signal(false);
  protected readonly saving = signal(false);
  protected readonly projectOptions = signal<ProjectOption[]>([]);
  protected readonly loadingProjects = signal(false);
  protected readonly stagedFiles = signal<StagedFile[]>([]);
  protected readonly filePreviews = signal<EditorFilePreview[]>([]);
  protected readonly uploadingAttachments = signal(false);
  protected readonly attachmentAccept = TICKET_ATTACHMENT_ACCEPT;

  protected readonly isDirty = computed(
    () =>
      this.title().trim().length > 0 ||
      !!this.selectedProjectId() ||
      !!this.selectedTicketType() ||
      this.description().trim().length > 0,
  );

  protected readonly isValid = computed(
    () =>
      this.title().trim().length > 0 &&
      !!this.selectedProjectId() &&
      !!this.selectedTicketType() &&
      this.description().trim().length > 0,
  );

  ngOnInit(): void {
    this.loadingProjects.set(true);
    this.projectService.getAll(0, 200).subscribe({
      next: (res) => {
        this.projectOptions.set(res.content.map((p) => ({ label: p.name, value: p.id })));
        this.loadingProjects.set(false);
      },
      error: () => this.loadingProjects.set(false),
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!this.isDirty()) return true;
    this.showLeaveDialog.set(true);
    return new Observable<boolean>((observer) => {
      this.leaveSubject.subscribe((result) => {
        observer.next(result);
        observer.complete();
      });
    });
  }

  protected goBack(): void {
    this.router.navigate(['/ticket-management/list']);
  }

  protected openTicketTypeDialog(): void {
    this.showTicketTypeDialog.set(true);
  }

  protected onTicketTypeConfirmed(selection: SelectedTicketType): void {
    this.selectedTicketType.set(selection);
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

  protected onLeaveConfirmed(): void {
    this.showLeaveDialog.set(false);
    this.leaveSubject.next(true);
  }

  protected onLeaveCancelled(): void {
    this.showLeaveDialog.set(false);
    this.leaveSubject.next(false);
  }

  protected onSubmit(): void {
    const ticketType = this.selectedTicketType();
    const projectId = this.selectedProjectId();
    if (!this.isValid() || !ticketType || !projectId) return;

    this.saving.set(true);
    this.ticketService
      .create({
        title: this.title().trim(),
        projectId,
        subCategoryId: ticketType.subCategoryId,
        description: this.description().trim() || undefined,
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'สร้าง Ticket เรียบร้อยแล้ว',
            life: 3000,
          });
          this.uploadAttachments(created.id);
          this.resetForm();
          this.router.navigate(['/ticket-management/list']);
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถสร้าง Ticket ได้',
            life: 3000,
          });
        },
      });
  }

  private uploadAttachments(ticketId: string): void {
    const files = this.stagedFiles().map((f) => f.file);
    if (files.length === 0) return;

    this.uploadingAttachments.set(true);
    let remaining = files.length;
    for (const file of files) {
      this.ticketService.uploadAttachment(ticketId, file).subscribe({
        next: () => {
          remaining -= 1;
          if (remaining === 0) this.uploadingAttachments.set(false);
        },
        error: () => {
          remaining -= 1;
          if (remaining === 0) this.uploadingAttachments.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'แนบไฟล์ไม่สำเร็จ',
            detail: `ไม่สามารถแนบไฟล์ ${file.name} ได้ กรุณาแนบใหม่ในหน้ารายละเอียด Ticket`,
            life: 5000,
          });
        },
      });
    }
  }

  protected formatInterval(value: number, unit: string): string {
    const units: Record<string, string> = {
      MINUTE: 'นาที', HOUR: 'ชั่วโมง', DAY: 'วัน',
      WEEK: 'สัปดาห์', MONTH: 'เดือน', YEAR: 'ปี',
    };
    return `${value} ${units[unit] ?? unit}`;
  }

  private resetForm(): void {
    this.title.set('');
    this.selectedProjectId.set(null);
    this.selectedTicketType.set(null);
    this.description.set('');
    for (const f of this.stagedFiles()) URL.revokeObjectURL(f.url);
    this.stagedFiles.set([]);
    this.filePreviews.set([]);
  }
}
