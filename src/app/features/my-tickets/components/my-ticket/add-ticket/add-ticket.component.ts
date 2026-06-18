import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TextEditorComponent } from '../../../../../shared/components/text-editor';
import { TicketTypeDialogComponent } from '../../../../ticket-management/components/ticket-type-dialog/ticket-type-dialog.component';
import { SelectedTicketType } from '../../../../ticket-management/components/ticket-type-dialog/ticket-type-dialog.types';
import { ConfirmDialogComponent } from '../../../../../shared/components/dialogs';
import { CanDeactivateComponent } from '../../../../../core/guards/unsaved-changes.guard';

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
export class AddTicketComponent implements CanDeactivateComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly leaveSubject = new Subject<boolean>();

  protected readonly title = signal('');
  protected readonly selectedProject = signal<string | null>(null);
  protected readonly selectedTicketType = signal<SelectedTicketType | null>(null);
  protected readonly description = signal('');
  protected readonly showTicketTypeDialog = signal(false);
  protected readonly showLeaveDialog = signal(false);
  protected readonly saving = signal(false);

  protected readonly projectOptions = [
    { label: 'Helpdesk', value: 'helpdesk' },
    { label: 'Internal Tools', value: 'internal-tools' },
    { label: 'Customer Portal', value: 'customer-portal' },
    { label: 'Infrastructure', value: 'infrastructure' },
  ];

  protected readonly isDirty = computed(
    () =>
      this.title().trim().length > 0 ||
      !!this.selectedProject() ||
      !!this.selectedTicketType() ||
      this.description().trim().length > 0,
  );

  protected readonly isValid = computed(
    () =>
      this.title().trim().length > 0 &&
      !!this.selectedProject() &&
      !!this.selectedTicketType() &&
      this.description().trim().length > 0,
  );

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
    this.router.navigate(['/my-tickets']);
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
    if (!this.isValid()) return;
    this.saving.set(true);
    // TODO: call create ticket API
    setTimeout(() => {
      this.saving.set(false);
      this.resetForm();
      this.messageService.add({
        severity: 'success',
        summary: 'สำเร็จ',
        detail: 'สร้าง Ticket เรียบร้อยแล้ว',
        life: 3000,
      });
      this.router.navigate(['/my-tickets']);
    }, 600);
  }

  private resetForm(): void {
    this.title.set('');
    this.selectedProject.set(null);
    this.selectedTicketType.set(null);
    this.description.set('');
  }
}
