import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { TicketSubCategoryService } from '../../../services/ticket-sub-category.service';
import { StatusFlowService } from '../../../../../features/status-management/services/status-flow.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly ticketCategoryService = inject(TicketCategoryService);
  private readonly ticketSubCategoryService = inject(TicketSubCategoryService);
  private readonly statusFlowService = inject(StatusFlowService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly submitting = signal(false);
  protected readonly showSubCategoryDialog = signal(false);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showPasswordDialog = signal(false);
  protected readonly selectedSubCategoryValues = signal<string[]>([]);
  protected readonly statusFlowOptions = signal<{ value: string; label: string }[]>([]);
  protected readonly subCategoryOptions = signal<SelectItemOption[]>([]);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    statusFlowId: [null as string | null, Validators.required],
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.statusFlowService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.statusFlowOptions.set(res.content.map((sf) => ({ value: sf.id, label: sf.name })));
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล Status Flow ได้',
          life: 4000,
        }),
    });

    this.ticketSubCategoryService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.subCategoryOptions.set(res.content.map((s) => ({ value: s.id, label: s.name })));
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล Sub-Category ได้',
          life: 4000,
        }),
    });

    this.ticketCategoryService.getById(this.id).subscribe({
      next: (res) => {
        this.form.patchValue({ name: res.name, statusFlowId: res.statusFlowId });
        this.selectedSubCategoryValues.set(res.subCategories.map((s) => s.id));
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

  protected readonly selectedSubCategories = computed(() =>
    this.subCategoryOptions().filter((opt) =>
      this.selectedSubCategoryValues().includes(opt.value),
    ),
  );

  protected readonly canSubmit = computed(
    () => this.form.valid && this.selectedSubCategoryValues().length > 0,
  );

  protected readonly currentName = computed(() => this.form.get('name')?.value ?? '');

  protected isNameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isStatusFlowInvalid(): boolean {
    const ctrl = this.form.get('statusFlowId');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected removeSubCategory(value: string): void {
    this.selectedSubCategoryValues.update((current) => current.filter((v) => v !== value));
  }

  protected onSubCategoryConfirmed(selected: string[]): void {
    this.selectedSubCategoryValues.set(selected);
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/category/detail', this.id]);
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
    this.ticketCategoryService
      .update(this.id, {
        name: this.form.value.name!,
        statusFlowId: this.form.value.statusFlowId!,
        subCategoryIds: this.selectedSubCategoryValues(),
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'บันทึกสำเร็จ',
            detail: 'แก้ไข Category เรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/ticket-type-management/category/detail', this.id]);
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
