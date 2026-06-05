import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';

@Component({
  selector: 'app-add-user-type',
  imports: [ReactiveFormsModule, Button, InputText, RadioButton, Divider],
  templateUrl: './add-user-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserTypeComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    typeName: ['', Validators.required],
    myTickets: ['none'],
    allProjects: ['none'],
    notifications: ['none'],
    dashboard: ['none'],
    allTickets: ['none'],
    projectManagement: ['none'],
    userManagement: ['none'],
    companyManagement: ['none'],
    dataManagement: ['none'],
  });

  protected onBack(): void {
    this.router.navigate(['/user-type-management/list']);
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    // TODO: call save API
    this.messageService.add({
      severity: 'success',
      summary: 'สำเร็จ',
      detail: 'เพิ่มประเภทผู้ใช้เรียบร้อยแล้ว',
      life: 4000,
    });
    this.saving.set(false);
    this.router.navigate(['/user-type-management/list']);
  }
}
