import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../../shared/components/dialogs';

type Priority = 'น้อย' | 'ปานกลาง' | 'มาก';

@Component({
  selector: 'app-edit-sub-category',
  imports: [
    ReactiveFormsModule,
    Button,
    InputText,
    Select,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './edit-sub-category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSubCategoryComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly submitting = signal(false);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showPasswordDialog = signal(false);

  // TODO: pre-fill from route params / service
  protected readonly form = this.fb.group({
    name: ['Network Design', Validators.required],
    priority: ['น้อย' as Priority | null, Validators.required],
    relatedPosition: ['Back-end' as string | null, Validators.required],
    status: ['active' as string | null, Validators.required],
  });

  protected readonly priorityOptions: { value: Priority; label: string }[] = [
    { value: 'น้อย', label: 'น้อย' },
    { value: 'ปานกลาง', label: 'ปานกลาง' },
    { value: 'มาก', label: 'มาก' },
  ];

  protected readonly relatedPositionOptions: { value: string; label: string }[] = [
    { value: 'Front-end', label: 'Front-end' },
    { value: 'Back-end', label: 'Back-end' },
    { value: 'Full-stack', label: 'Full-stack' },
    { value: 'DevOps', label: 'DevOps' },
    { value: 'QA', label: 'QA' },
    { value: 'UX/UI', label: 'UX/UI' },
    { value: 'Database', label: 'Database' },
    { value: 'Network', label: 'Network' },
  ];

  protected readonly statusOptions = [
    { value: 'active', label: 'ใช้งาน' },
    { value: 'inactive', label: 'ไม่ใช้งาน' },
  ];

  protected readonly canSubmit = computed(() => this.form.valid);
  protected readonly currentName = computed(() => this.form.get('name')?.value ?? '');

  protected isNameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isPriorityInvalid(): boolean {
    const ctrl = this.form.get('priority');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isRelatedPositionInvalid(): boolean {
    const ctrl = this.form.get('relatedPosition');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isStatusInvalid(): boolean {
    const ctrl = this.form.get('status');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/sub-category/detail']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (!this.canSubmit()) return;
    this.showConfirmDialog.set(true);
  }

  protected onConfirmStep1(): void {
    this.showConfirmDialog.set(false);
    this.showPasswordDialog.set(true);
  }

  protected onSaveConfirmed(_password: string): void {
    this.submitting.set(true);
    // TODO: call update sub-category API with _password
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'แก้ไข Sub-Category เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-type-management/sub-category/detail']);
    this.submitting.set(false);
  }
}
