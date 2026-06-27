import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
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
import { TicketTypeService } from '../../../services/ticket-type.service';
import { TicketCategoryService } from '../../../services/ticket-category.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly ticketTypeService = inject(TicketTypeService);
  private readonly ticketCategoryService = inject(TicketCategoryService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly submitting = signal(false);
  protected readonly showCategoryDialog = signal(false);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showPasswordDialog = signal(false);
  protected readonly selectedCategoryValues = signal<string[]>([]);
  protected readonly categoryOptions = signal<SelectItemOption[]>([]);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.ticketCategoryService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.categoryOptions.set(res.content.map((c) => ({ value: c.id, label: c.name })));
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล Category ได้',
          life: 4000,
        }),
    });

    this.ticketTypeService.getById(this.id).subscribe({
      next: (res) => {
        this.form.patchValue({ name: res.name });
        this.selectedCategoryValues.set(res.categories.map((c) => c.id));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลได้',
          life: 4000,
        });
        this.router.navigate(['/ticket-type-management/list']);
      },
    });
  }

  protected readonly selectedCategories = computed(() =>
    this.categoryOptions().filter((opt) => this.selectedCategoryValues().includes(opt.value)),
  );

  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  protected readonly canSubmit = computed(
    () => this.formStatus() === 'VALID' && this.selectedCategoryValues().length > 0,
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
    this.router.navigate(['/ticket-type-management/ticket-type/detail', this.id]);
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
    this.ticketTypeService
      .update(this.id, { name: this.form.value.name!, categoryIds: this.selectedCategoryValues() })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'บันทึกสำเร็จ',
            detail: 'แก้ไขประเภท Ticket เรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/ticket-type-management/ticket-type/detail', this.id]);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถบันทึกข้อมูลได้',
            life: 4000,
          });
          this.submitting.set(false);
        },
      });
  }
}
