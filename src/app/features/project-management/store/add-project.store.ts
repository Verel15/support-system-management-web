import { computed, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { SelectItemOption } from '../../../shared/components/dialogs';

export interface UserDetail {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

@Injectable()
export class AddProjectStore {
  readonly step1Form = new FormGroup({
    projectColor: new FormControl('#3b82f6', { nonNullable: true }),
    projectName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    company: new FormControl('', {
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

  // Derived signals from form (same API as before — step 2 & 3 components unaffected)
  readonly projectColor = computed(() => this.formValues().projectColor ?? '#3b82f6');
  readonly projectName = computed(() => this.formValues().projectName ?? '');
  readonly company = computed(() => this.formValues().company ?? '');
  readonly startDate = computed(() => this.formValues().startDate ?? null);
  readonly endDate = computed(() => this.formValues().endDate ?? null);
  readonly step1Valid = computed(() => this.formStatus() === 'VALID');

  // Step 2 state (not form-based)
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

  readonly customerUsers: UserDetail[] = [
    { id: '1', name: 'แสนดี ที่สุดเลย', role: 'ลูกค้า', initials: 'แ', color: '#3b82f6' },
    { id: '2', name: 'สดใส สวยงาม', role: 'ลูกค้า', initials: 'ส', color: '#f59e0b' },
    { id: '3', name: 'สมศรี มีเกียติ', role: 'ลูกค้า', initials: 'ส', color: '#ec4899' },
    { id: '4', name: 'มาโมรุ มุคาวะ', role: 'ลูกค้า', initials: 'ม', color: '#10b981' },
    { id: '5', name: 'สุชาติ มีกลิ่น', role: 'ลูกค้า', initials: 'ส', color: '#8b5cf6' },
    { id: '6', name: 'กรถนก หลากสี', role: 'ลูกค้า', initials: 'ก', color: '#ef4444' },
    { id: '7', name: 'อธชร ชิมรส', role: 'ลูกค้า', initials: 'อ', color: '#f97316' },
  ];

  readonly managerUsers: UserDetail[] = [
    { id: '8', name: 'มานี มีตา', role: 'ผู้พัฒนา', initials: 'ม', color: '#f59e0b' },
    { id: '9', name: 'ชูใจ ใจดี', role: 'ผู้พัฒนา', initials: 'ช', color: '#3b82f6' },
    { id: '10', name: 'แก้ว กินน้ำ', role: 'ผู้พัฒนา', initials: 'แ', color: '#ec4899' },
    { id: '11', name: 'สมหมาย ใจดี', role: 'ผู้พัฒนา', initials: 'ส', color: '#10b981' },
    { id: '12', name: 'รัตนา ดีใจ', role: 'ผู้พัฒนา', initials: 'ร', color: '#8b5cf6' },
  ];

  readonly customerOptions: SelectItemOption[] = this.customerUsers.map((u) => ({
    value: u.id,
    label: u.name,
  }));

  readonly managerOptions: SelectItemOption[] = this.managerUsers.map((u) => ({
    value: u.id,
    label: u.name,
  }));

  readonly selectedCustomers = computed(() =>
    this.selectedCustomerIds()
      .map((id) => this.customerUsers.find((u) => u.id === id))
      .filter((u): u is UserDetail => !!u),
  );

  readonly selectedManagers = computed(() =>
    this.selectedManagerIds()
      .map((id) => this.managerUsers.find((u) => u.id === id))
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
}
