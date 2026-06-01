import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { MessageService } from 'primeng/api';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  const errors: ValidationErrors = {};
  if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
  if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
  if (!/[0-9]/.test(value)) errors['noNumber'] = true;
  if (value.length < 8 || value.length > 16) errors['invalidLength'] = true;
  return Object.keys(errors).length ? errors : null;
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pw === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, Password, Button, Fluid],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  private newPasswordControl = this.fb.control('', [Validators.required, passwordStrengthValidator]);
  private confirmPasswordControl = this.fb.control('', [Validators.required]);

  form = this.fb.group(
    {
      newPassword: this.newPasswordControl,
      confirmPassword: this.confirmPasswordControl,
    },
    { validators: passwordsMatchValidator },
  );

  private newPassword = toSignal(this.newPasswordControl.valueChanges, { initialValue: '' });

  hasUppercase = computed(() => /[A-Z]/.test(this.newPassword() ?? ''));
  hasLowercase = computed(() => /[a-z]/.test(this.newPassword() ?? ''));
  hasNumber = computed(() => /[0-9]/.test(this.newPassword() ?? ''));
  hasValidLength = computed(() => {
    const len = (this.newPassword() ?? '').length;
    return len >= 8 && len <= 16;
  });

  isNewPasswordInvalid(): boolean {
    return this.newPasswordControl.invalid && this.newPasswordControl.touched;
  }

  isConfirmPasswordInvalid(): boolean {
    return this.confirmPasswordControl.invalid && this.confirmPasswordControl.touched;
  }

  isPasswordMismatch(): boolean {
    return (
      this.form.hasError('passwordsMismatch') &&
      this.confirmPasswordControl.touched
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.messageService.add({
      severity: 'success',
      summary: 'เปลี่ยนรหัสผ่านสำเร็จ',
      detail: 'รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่',
      life: 4000,
    });
    this.router.navigate(['/auth/login']);
  }
}
