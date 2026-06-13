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
  SelectItemsDialogComponent,
  SelectItemOption,
} from '../../../../../shared/components/dialogs';

@Component({
  selector: 'app-add-ticket-type',
  imports: [ReactiveFormsModule, Button, InputText, SelectItemsDialogComponent],
  templateUrl: './add-ticket-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTicketTypeComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly submitting = signal(false);
  protected readonly showCategoryDialog = signal(false);
  protected readonly selectedCategoryValues = signal<string[]>([]);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
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
    this.router.navigate(['/ticket-type-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    // TODO: call create ticket type API
    this.messageService.add({
      severity: 'success',
      summary: 'เพิ่มสำเร็จ',
      detail: 'เพิ่มประเภท Ticket เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-type-management/list']);
    this.submitting.set(false);
  }
}
