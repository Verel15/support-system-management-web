import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, of, take } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { AccountType, UserRequest } from '../../interfaces/user.interface';
import { UserTypeService } from '../../../user-type-management/services/user-type.service';
import { DepartmentService } from '../../services/department.service';
import { PositionService } from '../../services/position.service';

@Component({
  selector: 'app-edit-user',
  imports: [ReactiveFormsModule, Button, InputText, Select],
  templateUrl: './edit-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly userService = inject(UserService);
  private readonly userTypeService = inject(UserTypeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly positionService = inject(PositionService);

  private readonly userId = this.route.snapshot.params['id'] as string;

  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly user = toSignal(
    this.userService.getById(this.userId).pipe(catchError(() => of(null))),
  );

  protected readonly userTypeOptions = toSignal(
    this.userTypeService.getAll().pipe(
      map((types) => types.map((t) => ({ label: t.name, value: t.id }))),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  protected readonly departmentOptions = toSignal(
    this.departmentService.getAll().pipe(
      map((depts) => depts.map((d) => ({ label: d.name, value: d.id }))),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  protected readonly positionOptions = toSignal(
    this.positionService.getAll().pipe(
      map((page) => page.content.map((p) => ({ label: p.name, value: p.id }))),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  protected readonly form = this.fb.group({
    userType: [null as string | null, Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    department: [null as string | null, Validators.required],
    position: [null as string | null, Validators.required],
    email: [{ value: '', disabled: true }],
  });

  protected readonly projects = signal<{ name: string }[]>([]);

  constructor() {
    toObservable(this.user)
      .pipe(
        filter(Boolean),
        take(1),
        takeUntilDestroyed(),
      )
      .subscribe((u) => {
        this.form.patchValue({
          userType: u.userTypeId,
          firstName: u.firstName,
          lastName: u.lastName,
          phone: u.phone ?? '',
          department: u.departmentId,
          position: u.positionId,
          email: u.email,
        });
        if (u.profileImageUrl) {
          this.avatarPreview.set(u.profileImageUrl);
        }
      });
  }

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
    this.router.navigate(['/user-management/list']);
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const u = this.user();
    if (!u) return;

    const v = this.form.getRawValue();
    const payload: UserRequest = {
      accountType: u.accountType as AccountType,
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phone: v.phone || undefined,
      userTypeId: v.userType ?? undefined,
      departmentId: v.department ?? undefined,
      positionId: v.position ?? undefined,
    };

    this.submitting.set(true);
    this.userService
      .update(this.userId, payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'บันทึกสำเร็จ',
            detail: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว',
            life: 3000,
          });
          this.router.navigate(['/user-management/detail', this.userId]);
        },
      });
  }
}
