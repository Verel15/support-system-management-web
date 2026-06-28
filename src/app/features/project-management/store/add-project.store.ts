import { computed, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { SelectItemOption } from '../../../shared/components/dialogs';
import { CompanyService } from '../../company-management/services/company.service';
import { UserService } from '../../user-management/services/user.service';
import { UserResponse } from '../../user-management/interfaces/user.interface';

export interface UserDetail {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

const AVATAR_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#10b981', '#eab308',
];

function toUserDetail(u: UserResponse, role: string, index: number): UserDetail {
  const name = `${u.firstName} ${u.lastName}`;
  return {
    id: u.id,
    name,
    role,
    initials: u.firstName?.[0] ?? '?',
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
}

@Injectable()
export class AddProjectStore {
  private readonly companyService = inject(CompanyService);
  private readonly userService = inject(UserService);

  readonly step1Form = new FormGroup({
    projectColor: new FormControl('#3b82f6', { nonNullable: true }),
    projectName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    companyId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    startDate: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
    endDate: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
  });

  private readonly formValues = toSignal(this.step1Form.valueChanges, {
    initialValue: this.step1Form.value,
  });

  private readonly formStatus = toSignal(this.step1Form.statusChanges, {
    initialValue: this.step1Form.status,
  });

  readonly projectColor = computed(() => this.formValues().projectColor ?? '#3b82f6');
  readonly projectName = computed(() => this.formValues().projectName ?? '');
  readonly startDate = computed(() => this.formValues().startDate ?? null);
  readonly endDate = computed(() => this.formValues().endDate ?? null);
  readonly step1Valid = computed(() => this.formStatus() === 'VALID');

  readonly uploadedFiles = signal<File[]>([]);
  readonly selectedCustomerIds = signal<string[]>([]);
  readonly selectedManagerIds = signal<string[]>([]);

  readonly colorOptions = [
    { value: '#3b82f6', label: 'น้ำเงิน' },
    { value: '#ef4444', label: 'แดง' },
    { value: '#22c55e', label: 'เขียว' },
    { value: '#f59e0b', label: 'เหลือง' },
    { value: '#8b5cf6', label: 'ม่วง' },
    { value: '#ec4899', label: 'ชมพู' },
    { value: '#06b6d4', label: 'ฟ้า' },
    { value: '#f97316', label: 'ส้ม' },
  ];

  private readonly companiesRaw = toSignal(
    this.companyService.getAll().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  private readonly customerUsersRaw = toSignal(
    this.userService.getAll({ accountType: 'CUSTOMER' }, 0, 200).pipe(
      map((page) => page.content),
      catchError(() => of([])),
    ),
    { initialValue: [] as UserResponse[] },
  );

  private readonly assigneeUsersRaw = toSignal(
    this.userService.getAll({ accountType: 'EXTERNAL' }, 0, 200).pipe(
      map((page) => page.content),
      catchError(() => of([])),
    ),
    { initialValue: [] as UserResponse[] },
  );

  readonly companyOptions = computed(() =>
    this.companiesRaw().map((c) => ({ label: c.name, value: c.id })),
  );

  readonly company = computed(() => {
    const id = this.formValues().companyId ?? '';
    return this.companiesRaw().find((c) => c.id === id)?.name ?? '';
  });

  readonly customerUsers = computed<UserDetail[]>(() =>
    this.customerUsersRaw().map((u, i) => toUserDetail(u, 'ลูกค้า', i)),
  );

  readonly managerUsers = computed<UserDetail[]>(() =>
    this.assigneeUsersRaw().map((u, i) => toUserDetail(u, 'ผู้พัฒนา', i)),
  );

  readonly customerOptions = computed<SelectItemOption[]>(() =>
    this.customerUsers().map((u) => ({ value: u.id, label: u.name, sublabel: u.role })),
  );

  readonly managerOptions = computed<SelectItemOption[]>(() =>
    this.managerUsers().map((u) => ({ value: u.id, label: u.name, sublabel: u.role })),
  );

  readonly selectedCustomers = computed(() =>
    this.selectedCustomerIds()
      .map((id) => this.customerUsers().find((u) => u.id === id))
      .filter((u): u is UserDetail => !!u),
  );

  readonly selectedManagers = computed(() =>
    this.selectedManagerIds()
      .map((id) => this.managerUsers().find((u) => u.id === id))
      .filter((u): u is UserDetail => !!u),
  );

  readonly projectStatus = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    if (!start || !end) return null;
    const now = new Date();
    if (now < start) {
      const days = Math.ceil((start.getTime() - now.getTime()) / 86_400_000);
      return { type: 'waiting', label: 'รอเปิดโครงการ', detail: `โครงการจะเปิดในอีก ${days} วัน` };
    }
    if (now > end) {
      return { type: 'closed', label: 'ปิดโครงการ', detail: 'โครงการสิ้นสุดแล้ว' };
    }
    const days = Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
    return { type: 'open', label: 'กำลังดำเนินการ', detail: `เหลือเวลาอีก ${days} วัน` };
  });

  readonly statusBoxClass = computed(() => {
    const type = this.projectStatus()?.type;
    if (type === 'open') return 'bg-primary-50 text-primary-700';
    if (type === 'closed') return 'bg-error-50 text-error-700';
    return 'bg-blue-50 text-blue-700';
  });

  removeCustomer(id: string): void {
    this.selectedCustomerIds.update((ids) => ids.filter((i) => i !== id));
  }

  removeManager(id: string): void {
    this.selectedManagerIds.update((ids) => ids.filter((i) => i !== id));
  }

  formatThaiDate(date: Date | null): string {
    if (!date) return '-';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = ((date.getFullYear() + 543) % 100).toString().padStart(2, '0');
    return `${d}/${m}/${y}`;
  }

  getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'pi pi-video';
    if (ext === 'pdf') return 'pi pi-file-pdf';
    return 'pi pi-file';
  }

  toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
