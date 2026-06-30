import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TextEditorComponent } from '../../../../shared/components/text-editor';
import { TicketTypeDialogComponent } from '../ticket-type-dialog/ticket-type-dialog.component';
import { SelectedTicketType } from '../ticket-type-dialog/ticket-type-dialog.types';
import { ConfirmDialogComponent } from '../../../../shared/components/dialogs';
import { CanDeactivateComponent } from '../../../../core/guards/unsaved-changes.guard';
import { TicketService } from '../../services/ticket.service';
import { ProjectService } from '../../../project-management/services/project.service';

interface ProjectOption {
  label: string;
  value: string;
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
        next: () => {
          this.saving.set(false);
          this.resetForm();
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'สร้าง Ticket เรียบร้อยแล้ว',
            life: 3000,
          });
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
  }
}
