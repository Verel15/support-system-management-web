import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import {
  DataTableCellDirective,
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table';

interface SystemUser {
  name: string;
  type: string;
  ticketCount: number;
  email: string;
}

const MOCK_USERS: SystemUser[] = [
  { name: 'ใจงาม สุดใจจริง',          type: 'แอดมิน',   ticketCount: 3, email: 'Jaiknam@gmail.com' },
  { name: 'มานี มีตา',               type: 'ผู้พัฒนา', ticketCount: 4, email: 'Manee@gmail.com' },
  { name: 'สิริ สวัสดี',             type: 'ผู้พัฒนา', ticketCount: 5, email: 'Siri@gmail.com' },
  { name: 'มีตัง ต้นเดือน',          type: 'ผู้พัฒนา', ticketCount: 0, email: 'Metung@gmail.com' },
  { name: 'ชูใจ ใจดี',              type: 'ผู้พัฒนา', ticketCount: 0, email: 'Shujai@gmail.com' },
  { name: 'ปิติ ยินดี',             type: 'ผู้พัฒนา', ticketCount: 1, email: 'Piti@gmail.com' },
  { name: 'ตุ๊กตุ๊ก ตุ๊กแก',         type: 'ผู้พัฒนา', ticketCount: 2, email: 'Tuktuk@gmail.com' },
  { name: 'แก้ว กินน้ำ',            type: 'ผู้พัฒนา', ticketCount: 3, email: 'Kwaw@gmail.com' },
  { name: 'มะลิลา ขึ้นต้นเป็นมะลิซ้อน', type: 'ผู้พัฒนา', ticketCount: 6, email: 'Malila@gmail.com' },
  { name: 'จอมจอน จินจิน',          type: 'ผู้พัฒนา', ticketCount: 2, email: 'Jomjon@gmail.com' },
];

@Component({
  selector: 'app-users-in-system-card',
  imports: [
    ReactiveFormsModule,
    DatePicker,
    IconField,
    InputIcon,
    InputText,
    DataTableComponent,
    DataTableCellDirective,
  ],
  templateUrl: './users-in-system-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersInSystemCardComponent {
  protected readonly dateCtrl = new FormControl<Date | null>(new Date());
  protected readonly searchQuery = signal('');

  protected readonly columns: TableColumn[] = [
    { field: 'name',        header: 'ผู้รับผิดชอบ',         sortable: true },
    { field: 'type',        header: 'ประเภท',               sortable: true },
    { field: 'ticketCount', header: 'จำนวน Tickets ที่ถือ', sortable: true },
    { field: 'email',       header: 'อีเมล',                sortable: true },
  ];

  protected readonly rows = computed((): Record<string, unknown>[] => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return MOCK_USERS as unknown as Record<string, unknown>[];
    return MOCK_USERS.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.type.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
    ) as unknown as Record<string, unknown>[];
  });

  protected readonly totalRecords = computed(() => this.rows().length);
}
