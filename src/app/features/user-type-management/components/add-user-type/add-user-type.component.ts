import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { finalize } from 'rxjs/operators';
import { UserTypeService } from '../../services/user-type.service';
import { UserTypeRequest } from '../../interfaces/user-type.interface';

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
  private readonly userTypeService = inject(UserTypeService);

  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    typeName: ['', Validators.required],
    myTickets: ['NONE'],
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
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const payload: UserTypeRequest = {
      name: v.typeName!,
      myTicketAccess: v.myTickets!,
      allProjectAccess: v.allProjects === 'yes',
      notificationAccess: v.notifications === 'yes',
      dashboardAccess: v.dashboard === 'yes',
      allTicketAccess: v.allTickets === 'yes',
      manageProjectAccess: v.projectManagement === 'yes',
      manageUserAccess: v.userManagement === 'yes',
      manageCompanyAccess: v.companyManagement === 'yes',
      manageDataAccess: v.dataManagement === 'yes',
    };

    this.saving.set(true);
    this.userTypeService
      .create(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'เพิ่มประเภทผู้ใช้เรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/user-type-management/list']);
        },
      });
  }
}
