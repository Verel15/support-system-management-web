import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { RadioButton } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { AccountType, UserRequest } from '../../interfaces/user.interface';
import { UserTypeService } from '../../../user-type-management/services/user-type.service';
import { DepartmentService } from '../../services/department.service';
import { PositionService } from '../../services/position.service';
import { CompanyService } from '../../../company-management/services/company.service';

@Component({
  selector: 'app-add-user',
  imports: [ReactiveFormsModule, FormsModule, Button, InputText, Select, RadioButton],
  templateUrl: './add-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserComponent {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly userService = inject(UserService);
  private readonly userTypeService = inject(UserTypeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly positionService = inject(PositionService);
  private readonly companyService = inject(CompanyService);

  protected readonly avatarPreview = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly userFormatOptions = [
    { label: 'ลูกค้า', value: 'CUSTOMER' },
    { label: 'บุคคลภายนอก', value: 'EXTERNAL' },
  ];

  protected readonly companyOptions = toSignal(
    this.companyService.getAll().pipe(
      map((companies) => companies.map((c) => ({ label: c.name, value: c.id }))),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  protected readonly userTypeOptions = toSignal(
    this.userTypeService.getAll().pipe(
      map((types) => types.content.map((t) => ({ label: t.name, value: t.id }))),
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
      map((page) => page.map((p) => ({ label: p.name, value: p.id }))),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  protected readonly form = this.fb.group({
    userFormat: ['CUSTOMER' as AccountType, Validators.required],
    companyId: [null as string | null, Validators.required],
    userType: [null as string | null],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    department: [null as string | null],
    position: [null as string | null],
    phone: [''],
    email: ['', [Validators.required, Validators.email]],
  });

  private readonly selectedFormat = toSignal(
    this.form.get('userFormat')!.valueChanges,
    { initialValue: 'CUSTOMER' as AccountType },
  );

  protected readonly isCustomer = computed(() => this.selectedFormat() === 'CUSTOMER');

  constructor() {
    this.form.get('userFormat')!.valueChanges.subscribe((format) => {
      this.applyConditionalValidators(format as AccountType);
    });
  }

  private applyConditionalValidators(format: AccountType): void {
    const companyId = this.form.get('companyId')!;
    const userType = this.form.get('userType')!;
    const department = this.form.get('department')!;
    const position = this.form.get('position')!;

    if (format === 'CUSTOMER') {
      companyId.setValidators(Validators.required);
      [userType, department, position].forEach((c) => c.clearValidators());
    } else {
      companyId.clearValidators();
      [userType, department, position].forEach((c) => c.setValidators(Validators.required));
    }
    [companyId, userType, department, position].forEach((c) => {
      c.reset(null);
      c.updateValueAndValidity();
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

    const v = this.form.getRawValue();
    const payload: UserRequest = {
      accountType: v.userFormat as AccountType,
      firstName: v.firstName!,
      lastName: v.lastName!,
      email: v.email!,
      phone: v.phone || undefined,
      companyId: v.companyId ?? undefined,
      userTypeId: v.userType ?? undefined,
      departmentId: v.department ?? undefined,
      positionId: v.position ?? undefined,
    };

    this.submitting.set(true);
    this.userService
      .create(payload)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'เพิ่มผู้ใช้สำเร็จ',
            detail: 'สร้างผู้ใช้ใหม่เรียบร้อยแล้ว',
            life: 4000,
          });
          this.router.navigate(['/user-management/list']);
        },
      });
  }
}
