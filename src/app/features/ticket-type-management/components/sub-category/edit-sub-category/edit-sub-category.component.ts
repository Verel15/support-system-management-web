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
} from '../../../../../shared/components/dialogs';
import { TicketSubCategoryService } from '../../../services/ticket-sub-category.service';
import { PriorityService } from '../../../../../features/priority-management/services/priority.service';
import { PositionService } from '../../../../../features/user-management/services/position.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly ticketSubCategoryService = inject(TicketSubCategoryService);
  private readonly priorityService = inject(PriorityService);
  private readonly positionService = inject(PositionService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly submitting = signal(false);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showPasswordDialog = signal(false);
  protected readonly priorityOptions = signal<{ value: string; label: string }[]>([]);
  protected readonly positionOptions = signal<{ value: string; label: string }[]>([]);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    priorityLevelId: [null as string | null, Validators.required],
    positionId: [null as string | null, Validators.required],
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.priorityService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.priorityOptions.set(res.content.map((p) => ({ value: p.id, label: p.name })));
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลลำดับความสำคัญได้',
          life: 4000,
        }),
    });

    this.positionService.getAll().subscribe({
      next: (res) => {
        this.positionOptions.set(res.map((p) => ({ value: p.id, label: p.name })));
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลตำแหน่งได้',
          life: 4000,
        }),
    });

    this.ticketSubCategoryService.getById(this.id).subscribe({
      next: (res) => {
        this.form.patchValue({
          name: res.name,
          priorityLevelId: res.priorityLevelId,
          positionId: res.positionId,
        });
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

  protected readonly canSubmit = computed(() => this.form.valid);
  protected readonly currentName = computed(() => this.form.get('name')?.value ?? '');

  protected isNameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isPriorityInvalid(): boolean {
    const ctrl = this.form.get('priorityLevelId');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isPositionInvalid(): boolean {
    const ctrl = this.form.get('positionId');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/sub-category/detail', this.id]);
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
    this.ticketSubCategoryService
      .update(this.id, {
        name: this.form.value.name!,
        priorityLevelId: this.form.value.priorityLevelId!,
        positionId: this.form.value.positionId!,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'บันทึกสำเร็จ',
            detail: 'แก้ไข Sub-Category เรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/ticket-type-management/sub-category/detail', this.id]);
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
