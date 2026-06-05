import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { ConfirmDialogComponent, DeleteConfirmDialogComponent } from '../../../shared/components/dialogs';

interface UserTypeDetail {
  typeName: string;
  myTickets: 'customer' | 'admin' | 'none';
  allProjects: 'yes' | 'none';
  notifications: 'yes' | 'none';
  dashboard: 'yes' | 'none';
  allTickets: 'yes' | 'none';
  projectManagement: 'yes' | 'none';
  userManagement: 'yes' | 'none';
  companyManagement: 'yes' | 'none';
  dataManagement: 'yes' | 'none';
}

@Component({
  selector: 'app-edit-user-type',
  imports: [ReactiveFormsModule, Button, InputText, RadioButton, Divider, ConfirmDialogComponent, DeleteConfirmDialogComponent],
  templateUrl: './edit-user-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserTypeComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly saving = signal(false);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showPasswordDialog = signal(false);

  private readonly mockData: UserTypeDetail[] = [
    { typeName: 'ลูกค้า', myTickets: 'customer', allProjects: 'none', notifications: 'yes', dashboard: 'none', allTickets: 'none', projectManagement: 'none', userManagement: 'none', companyManagement: 'none', dataManagement: 'none' },
    { typeName: 'ผู้พัฒนา', myTickets: 'customer', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'yes', companyManagement: 'yes', dataManagement: 'yes' },
    { typeName: 'แอดมินภายนอก', myTickets: 'admin', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'none', companyManagement: 'none', dataManagement: 'none' },
    { typeName: 'ผู้พัฒนาภายนอก', myTickets: 'customer', allProjects: 'yes', notifications: 'yes', dashboard: 'none', allTickets: 'none', projectManagement: 'yes', userManagement: 'none', companyManagement: 'none', dataManagement: 'none' },
    { typeName: 'แอดมิน3', myTickets: 'admin', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'yes', companyManagement: 'none', dataManagement: 'none' },
    { typeName: 'แอดมิน2', myTickets: 'admin', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'yes', companyManagement: 'yes', dataManagement: 'none' },
    { typeName: 'แอดมิน', myTickets: 'admin', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'yes', companyManagement: 'yes', dataManagement: 'yes' },
  ];

  protected readonly typeName = signal(this.route.snapshot.paramMap.get('typeName') ?? '');

  protected readonly userType = computed(() =>
    this.mockData.find((u) => u.typeName === this.typeName()) ?? null
  );

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

  constructor() {
    const ut = this.userType();
    if (ut) {
      this.form.patchValue(ut);
    }
  }

  protected onBack(): void {
    this.router.navigate(['/user-type-management/list']);
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;
    this.showConfirmDialog.set(true);
  }

  protected onConfirmEdit(): void {
    this.showConfirmDialog.set(false);
    this.showPasswordDialog.set(true);
  }

  protected onPasswordConfirmed(_password: string): void {
    this.saving.set(true);
    // TODO: call update API
    this.messageService.add({
      severity: 'success',
      summary: 'สำเร็จ',
      detail: 'แก้ไขประเภทผู้ใช้เรียบร้อยแล้ว',
      life: 4000,
    });
    this.saving.set(false);
    this.router.navigate(['/user-type-management/list']);
  }
}
