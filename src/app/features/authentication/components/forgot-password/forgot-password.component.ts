import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';
import { AlertDialogComponent } from '../../../../shared/components/dialogs';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, InputText, Button, Fluid, AlertDialogComponent],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  showErrorDialog = signal(false);
  submittedEmail = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isEmailInvalid(): boolean {
    const ctrl = this.form.get('email')!;
    return ctrl.invalid && ctrl.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.value.email ?? '';
    this.submittedEmail.set(email);

    // Simulate: email not found → show error dialog
    // In real implementation, call auth service here
    const emailExistsInSystem = false; // replace with actual API call result
    if (!emailExistsInSystem) {
      this.showErrorDialog.set(true);
      return;
    }

    this.router.navigate(['/auth/check-email'], { queryParams: { email } });
  }

  closeErrorDialog(): void {
    this.showErrorDialog.set(false);
  }
}
