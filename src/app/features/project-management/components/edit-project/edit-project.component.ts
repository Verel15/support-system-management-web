import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';
import { ExistingFile, FileUploadComponent } from '../../../../shared/components/file-upload';

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'น้ำเงิน' },
  { value: '#ef4444', label: 'แดง' },
  { value: '#22c55e', label: 'เขียว' },
  { value: '#f59e0b', label: 'เหลือง' },
  { value: '#8b5cf6', label: 'ม่วง' },
  { value: '#ec4899', label: 'ชมพู' },
  { value: '#06b6d4', label: 'ฟ้า' },
  { value: '#f97316', label: 'ส้ม' },
];

@Component({
  selector: 'app-edit-project',
  imports: [ReactiveFormsModule, Button, DatePicker, InputText, Popover, FileUploadComponent],
  templateUrl: './edit-project.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProjectComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly colorPickerRef = viewChild.required<Popover>('colorPicker');

  protected readonly colorOptions = COLOR_OPTIONS;
  protected readonly projectColor = signal('#3b82f6');

  protected readonly existingFiles = signal<ExistingFile[]>([
    { id: '1', name: 'ชื่อไฟล์.pdf' },
    { id: '2', name: 'ชื่อไฟล์.pdf' },
  ]);

  protected readonly form = new FormGroup({
    projectName: new FormControl('Manage Pharmacy System', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    company: new FormControl('Techplus', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl<Date | null>(new Date(2023, 8, 1), {
      validators: [Validators.required],
    }),
    endDate: new FormControl<Date | null>(new Date(2023, 9, 30), {
      validators: [Validators.required],
    }),
  });

  get controls() {
    return this.form.controls;
  }

  protected openColorPicker(event: MouseEvent): void {
    this.colorPickerRef().toggle(event);
  }

  protected selectColor(value: string): void {
    this.projectColor.set(value);
    this.colorPickerRef().hide();
  }

  protected onFilesChange(_files: File[]): void {
    // new uploaded files handled by FileUploadComponent internally
  }

  protected onExistingFileRemoved(id: string): void {
    this.existingFiles.update((files) => files.filter((f) => f.id !== id));
  }

  protected goBack(): void {
    this.router.navigate(['/project-management/detail']);
  }

  protected onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.messageService.add({
      severity: 'success',
      summary: 'สำเร็จ',
      detail: 'บันทึกข้อมูลโครงการสำเร็จ',
      life: 3000,
    });
    this.router.navigate(['/project-management/detail']);
  }
}
