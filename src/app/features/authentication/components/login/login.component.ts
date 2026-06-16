import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { MessageService } from 'primeng/api';
import { Divider } from 'primeng/divider';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, NgOptimizedImage, InputText, Password, Button, Fluid, Divider],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isEmailInvalid(): boolean {
    const ctrl = this.form.get('email')!;
    return ctrl.invalid && ctrl.touched;
  }

  isPasswordInvalid(): boolean {
    const ctrl = this.form.get('password')!;
    return ctrl.invalid && ctrl.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // TODO: replace with actual auth service call
    const loginSuccess = true;

    if (!loginSuccess) {
      this.messageService.add({
        severity: 'error',
        summary: 'เข้าสู่ระบบไม่สำเร็จ',
        detail: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        life: 4000,
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'เข้าสู่ระบบสำเร็จ',
      detail: 'ยินดีต้อนรับเข้าสู่ระบบ',
      life: 3000,
    });
    this.router.navigate(['/dashboard']);
  }
}
