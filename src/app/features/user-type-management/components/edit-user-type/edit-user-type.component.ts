import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../shared/components/dialogs';
import { UserTypeService } from '../../services/user-type.service';
import { UserTypeRequest } from '../../interfaces/user-type.interface';

@Component({
  selector: 'app-edit-user-type',
  imports: [
    ReactiveFormsModule,
    Button,
    InputText,
    RadioButton,
    Divider,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './edit-user-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserTypeComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly userTypeService = inject(UserTypeService);

  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly saving = signal(false);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showPasswordDialog = signal(false);

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

  protected readonly userType = toSignal(
    this.userTypeService.getById(this.id).pipe(catchError(() => of(null))),
  );

  protected readonly typeName = computed(() => this.userType()?.name ?? '');

  constructor() {
    effect(() => {
      const ut = this.userType();
      if (!ut) return;
      this.form.patchValue({
        typeName: ut.name,
        myTickets: ut.myTicketAccess,
        allProjects: ut.allProjectAccess ? 'yes' : 'none',
        notifications: ut.notificationAccess ? 'yes' : 'none',
        dashboard: ut.dashboardAccess ? 'yes' : 'none',
        allTickets: ut.allTicketAccess ? 'yes' : 'none',
        projectManagement: ut.manageProjectAccess ? 'yes' : 'none',
        userManagement: ut.manageUserAccess ? 'yes' : 'none',
        companyManagement: ut.manageCompanyAccess ? 'yes' : 'none',
        dataManagement: ut.manageDataAccess ? 'yes' : 'none',
      });
    });
  }

  protected onBack(): void {
    this.router.navigate(['/user-type-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.showConfirmDialog.set(true);
  }

  protected onConfirmEdit(): void {
    this.showConfirmDialog.set(false);
    this.showPasswordDialog.set(true);
  }

  protected onPasswordConfirmed(_password: string): void {
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
      .update(this.id, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'แก้ไขประเภทผู้ใช้เรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/user-type-management/list']);
        },
      });
  }
}
