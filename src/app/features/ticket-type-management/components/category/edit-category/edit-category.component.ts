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
  SelectItemsDialogComponent,
  SelectItemOption,
} from '../../../../../shared/components/dialogs';

@Component({
  selector: 'app-edit-category',
  imports: [
    ReactiveFormsModule,
    Button,
    InputText,
    Select,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
    SelectItemsDialogComponent,
  ],
  templateUrl: './edit-category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoryComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly submitting = signal(false);
  protected readonly showSubCategoryDialog = signal(false);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showPasswordDialog = signal(false);

  // TODO: pre-fill from route params / service
  protected readonly selectedSubCategoryValues = signal<string[]>([
    'network-design',
    'network-configuration',
    'network-security',
    'network-monitoring',
    'network-troubleshooting',
  ]);

  protected readonly form = this.fb.group({
    name: ['Network', Validators.required],
    status: ['active' as string | null, Validators.required],
  });

  protected readonly statusOptions = [
    { value: 'active', label: 'ใช้งาน' },
    { value: 'inactive', label: 'ไม่ใช้งาน' },
  ];

  protected readonly subCategoryOptions: SelectItemOption[] = [
    { value: 'network-design', label: 'Network Design' },
    { value: 'network-configuration', label: 'Network Configuration' },
    { value: 'network-security', label: 'Network Security' },
    { value: 'network-monitoring', label: 'Network Monitoring' },
    { value: 'network-troubleshooting', label: 'Network Troubleshooting' },
    { value: 'software-usage', label: 'Software Usage' },
    { value: 'printer-not-working', label: 'Printer Not Working' },
    { value: 'access-request', label: 'Access Request' },
  ];

  protected readonly selectedSubCategories = computed(() =>
    this.subCategoryOptions.filter((opt) =>
      this.selectedSubCategoryValues().includes(opt.value),
    ),
  );

  protected readonly canSubmit = computed(() => this.form.valid);

  protected readonly currentName = computed(() => this.form.get('name')?.value ?? '');

  protected isNameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isStatusInvalid(): boolean {
    const ctrl = this.form.get('status');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected removeSubCategory(value: string): void {
    this.selectedSubCategoryValues.update((current) => current.filter((v) => v !== value));
  }

  protected onSubCategoryConfirmed(selected: string[]): void {
    this.selectedSubCategoryValues.set(selected);
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/category/detail']);
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
    // TODO: call update category API with _password
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'แก้ไข Category เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-type-management/category/detail']);
    this.submitting.set(false);
  }
}
