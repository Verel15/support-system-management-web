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
import { TicketTypeService } from '../../../services/ticket-type.service';
import { TicketCategoryService } from '../../../services/ticket-category.service';

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
  private readonly ticketTypeService = inject(TicketTypeService);
  private readonly ticketCategoryService = inject(TicketCategoryService);

  protected readonly submitting = signal(false);
  protected readonly showCategoryDialog = signal(false);
  protected readonly selectedCategoryValues = signal<string[]>([]);
  protected readonly categoryOptions = signal<SelectItemOption[]>([]);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
  });

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.ticketCategoryService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.categoryOptions.set(
          res.content.map((c) => ({ value: c.id, label: c.name })),
        );
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล Category ได้',
          life: 4000,
        }),
    });
  }

  protected readonly selectedCategories = computed(() =>
    this.categoryOptions().filter((opt) => this.selectedCategoryValues().includes(opt.value)),
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
    this.ticketTypeService
      .create({ name: this.form.value.name!, categoryIds: this.selectedCategoryValues() })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'เพิ่มสำเร็จ',
            detail: 'เพิ่มประเภท Ticket เรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/ticket-type-management/list']);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถเพิ่มประเภท Ticket ได้',
            life: 4000,
          });
          this.submitting.set(false);
        },
      });
  }
}
