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
import { MessageService } from 'primeng/api';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
  SelectItemsDialogComponent,
  SelectItemOption,
} from '../../../../../shared/components/dialogs';

@Component({
  selector: 'app-edit-ticket-type',
  imports: [
    ReactiveFormsModule,
    Button,
    InputText,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
    SelectItemsDialogComponent,
  ],
  templateUrl: './edit-ticket-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditTicketTypeComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly submitting = signal(false);
  protected readonly showCategoryDialog = signal(false);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showPasswordDialog = signal(false);

  // TODO: pre-fill from route params / service
  protected readonly selectedCategoryValues = signal<string[]>(['system', 'security']);

  protected readonly form = this.fb.group({
    name: ['Incident', Validators.required],
  });

  protected readonly categoryOptions: SelectItemOption[] = [
    { value: 'system', label: 'System' },
    { value: 'application', label: 'Application' },
    { value: 'network', label: 'Network' },
    { value: 'security', label: 'Security' },
    { value: 'software', label: 'Software' },
    { value: 'hardware-upgrades', label: 'Hardware Upgrades' },
    { value: 'access-permissions', label: 'Access Permissions' },
  ];

  protected readonly selectedCategories = computed(() =>
    this.categoryOptions.filter((opt) => this.selectedCategoryValues().includes(opt.value)),
  );

  protected readonly canSubmit = computed(
    () => this.form.valid && this.selectedCategoryValues().length > 0,
  );

  protected readonly currentName = computed(() => this.form.get('name')?.value ?? '');

  protected isNameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected removeCategory(value: string): void {
    this.selectedCategoryValues.update((current) => current.filter((v) => v !== value));
  }

  protected onCategoryConfirmed(selected: string[]): void {
    this.selectedCategoryValues.set(selected);
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/ticket-type/detail']);
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
    // TODO: call update API with _password
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'แก้ไขประเภท Ticket เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-type-management/ticket-type/detail']);
    this.submitting.set(false);
  }
}
