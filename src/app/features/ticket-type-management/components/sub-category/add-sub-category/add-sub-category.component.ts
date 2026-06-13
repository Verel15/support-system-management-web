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

type Priority = 'น้อย' | 'ปานกลาง' | 'มาก';

@Component({
  selector: 'app-add-sub-category',
  imports: [ReactiveFormsModule, Button, InputText, Select],
  templateUrl: './add-sub-category.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddSubCategoryComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    priority: [null as Priority | null, Validators.required],
    relatedPosition: ['', Validators.required],
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

  protected readonly canSubmit = computed(() => this.form.valid);

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

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    // TODO: call create sub-category API
    this.messageService.add({
      severity: 'success',
      summary: 'เพิ่มสำเร็จ',
      detail: 'เพิ่ม Sub-Category เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-type-management/list']);
    this.submitting.set(false);
  }
}
