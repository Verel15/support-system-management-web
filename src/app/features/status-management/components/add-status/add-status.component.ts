import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-status',
  imports: [ReactiveFormsModule, Button, InputText, Tooltip],
  templateUrl: './add-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStatusComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  protected readonly submitting = signal(false);

  protected readonly processingStatusControls = new FormArray<FormControl>([]);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    processingStatuses: this.processingStatusControls,
  });

  protected addProcessingStatus(): void {
    this.processingStatusControls.push(new FormControl('', Validators.required));
  }

  protected removeProcessingStatus(index: number): void {
    this.processingStatusControls.removeAt(index);
  }

  protected getStatusControl(index: number): FormControl {
    return this.processingStatusControls.at(index) as FormControl;
  }

  protected isNameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected isStatusInvalid(index: number): boolean {
    const ctrl = this.processingStatusControls.at(index);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected onBack(): void {
    this.router.navigate(['/status-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    // TODO: call create status API
    this.messageService.add({
      severity: 'success',
      summary: 'เพิ่มสถานะสำเร็จ',
      detail: 'สร้างสถานะใหม่เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/status-management/list']);
    this.submitting.set(false);
  }
}
