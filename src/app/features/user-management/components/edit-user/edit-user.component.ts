import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, Button, InputText, Select],
  templateUrl: './edit-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserComponent {
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly userTypeOptions = [
    { label: 'แอดมิน', value: 'admin' },
    { label: 'ลูกค้า', value: 'customer' },
    { label: 'ผู้พัฒนา', value: 'developer' },
  ];

  protected readonly departmentOptions = [
    { label: 'IT', value: 'it' },
    { label: 'HR', value: 'hr' },
    { label: 'Finance', value: 'finance' },
    { label: 'Design', value: 'design' },
    { label: 'Operations', value: 'operations' },
  ];

  protected readonly positionOptions = [
    { label: 'Manager', value: 'manager' },
    { label: 'Developer', value: 'developer' },
    { label: 'UX / UI', value: 'ux_ui' },
    { label: 'Analyst', value: 'analyst' },
  ];

  protected readonly projects = signal([
    { name: 'Book Bank System' },
    { name: 'Life Insurance System' },
    { name: 'Rent a car System' },
    { name: 'IT Supporting and Helpdesk Management System' },
    { name: 'Manage Pharmacy System' },
  ]);

  protected readonly form = this.fb.group({
    userType: ['developer', Validators.required],
    firstName: ['ยิ้มสวย', Validators.required],
    lastName: ['มากเลย', Validators.required],
    phone: ['000-000-0000'],
    department: ['design', Validators.required],
    position: ['ux_ui', Validators.required],
    email: [{ value: 'ABC', disabled: true }],
  });

  protected isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  protected onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  protected onBack(): void {
    this.location.back();
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว',
      life: 3000,
    });
    // TODO: call update user API
    this.submitting.set(false);
    this.location.back();
  }
}
