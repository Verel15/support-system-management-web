import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { RadioButton } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (password && confirm && password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-add-user',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    Button,
    InputText,
    Select,
    RadioButton
  ],
  templateUrl: './add-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly userFormatOptions = [
    { label: 'ลูกค้า', value: 'customer' },
    { label: 'บุคคลภายนอก', value: 'external' },
  ];

  protected readonly userTypeOptions = [
    { label: 'แอดมิน', value: 'admin' },
    { label: 'ลูกค้า', value: 'customer' },
    { label: 'ผู้พัฒนา', value: 'developer' },
  ];

  protected readonly departmentOptions = [
    { label: 'IT', value: 'it' },
    { label: 'HR', value: 'hr' },
    { label: 'Finance', value: 'finance' },
    { label: 'Operations', value: 'operations' },
  ];

  protected readonly positionOptions = [
    { label: 'Manager', value: 'manager' },
    { label: 'Developer', value: 'developer' },
    { label: 'Designer', value: 'designer' },
    { label: 'Analyst', value: 'analyst' },
  ];

  protected readonly form = this.fb.group({
    userFormat: ['customer', Validators.required],
    userType: [null as string | null, Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    department: [null as string | null, Validators.required],
    position: [null as string | null, Validators.required],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
  });

  protected isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  protected get passwordMismatch(): boolean {
    return !!(this.form.hasError('passwordMismatch') && this.form.get('confirmPassword')?.touched);
  }

  protected onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  protected onBack(): void {
    this.router.navigate(['/user-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.messageService.add({
      severity: 'success',
      summary: 'เพิ่มผู้ใช้สำเร็จ',
      detail: 'สร้างผู้ใช้ใหม่เรียบร้อยแล้ว',
      life: 4000,
    });
    // TODO: call create user API
    this.router.navigate(['/user-management/list']);
    this.submitting.set(false);
  }
}
