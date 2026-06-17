import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
} from '../../../../../shared/components/data-table';
import { ConfirmDialogComponent } from '../../../../../shared/components/dialogs';
import { ProjectMember } from '../project-detail.types';

@Component({
  selector: 'app-project-members',
  imports: [
    FormsModule,
    Button,
    Select,
    InputText,
    IconField,
    InputIcon,
    Menu,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
  ],
  templateUrl: './project-members.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMembersComponent {
  private readonly router = inject(Router);

  readonly addClick = output<void>();

  protected readonly actionMenu = viewChild.required<Menu>('actionMenu');
  protected readonly showRemoveDialog = signal(false);
  protected readonly removing = signal(false);

  protected readonly userTypeFilter = signal<string | null>(null);
  protected readonly positionFilter = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly userTypeOptions = [
    { label: 'ประเภทผู้ใช้ทั้งหมด', value: null },
    { label: 'แอดมิน', value: 'แอดมิน' },
    { label: 'ลูกค้า', value: 'ลูกค้า' },
    { label: 'ผู้พัฒนา', value: 'ผู้พัฒนา' },
  ];

  protected readonly positionOptions = [
    { label: 'ตำแหน่งทั้งหมด', value: null },
    { label: 'Develop', value: 'Develop' },
    { label: 'Design', value: 'Design' },
    { label: 'QA', value: 'QA' },
  ];

  private readonly allMembers: ProjectMember[] = [
    { id: '1', name: 'ใจงาม สุดใจจริง', userType: 'แอดมิน', position: 'Develop', email: 'Jaiknam@gmail.com' },
    { id: '2', name: 'แสนดี ที่สุดเลย', userType: 'ลูกค้า', position: '-', email: 'Sansee@gmail.com' },
    { id: '3', name: 'มานี มิตา', userType: 'ผู้พัฒนา', position: 'Develop', email: 'Manee@gmail.com' },
    { id: '4', name: 'ตุ๊กตุ๊ก ตุ๊กแก', userType: 'ผู้พัฒนา', position: 'Develop', email: 'Tuktuk@gmail.com' },
    { id: '5', name: 'สิริ สวัสดิ์', userType: 'ผู้พัฒนา', position: 'Develop', email: 'Siri@gmail.com' },
    { id: '6', name: 'มิตัง ต้นเดือน', userType: 'ผู้พัฒนา', position: 'Develop', email: 'Metung@gmail.com' },
    { id: '7', name: 'ชูใจ ใจดี', userType: 'ผู้พัฒนา', position: 'Develop', email: 'Shujai@gmail.com' },
    { id: '8', name: 'ปิดิ ยินดี', userType: 'ลูกค้า', position: '-', email: 'Piti@gmail.com' },
    { id: '9', name: 'แก้ว กันน้ำ', userType: 'ผู้พัฒนา', position: 'Develop', email: 'Kwaw@gmail.com' },
    { id: '10', name: 'มะลิลา ขึ้นต้นเป็นมะลิซ้อน', userType: 'ผู้พัฒนา', position: 'Develop', email: 'Malila@gmail.com' },
  ];

  protected readonly filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const userType = this.userTypeFilter();
    const position = this.positionFilter();
    return this.allMembers.filter(m => {
      const matchesSearch = !query || m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query);
      const matchesType = !userType || m.userType === userType;
      const matchesPosition = !position || m.position === position;
      return matchesSearch && matchesType && matchesPosition;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredMembers().length);

  protected readonly tableData = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredMembers()
      .slice(start, start + this.pageSize())
      .map(m => ({ ...m }) as Record<string, unknown>);
  });

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'รายชื่อ', sortable: true },
    { field: 'userType', header: 'ประเภทผู้ใช้', sortable: true },
    { field: 'position', header: 'ตำแหน่ง', sortable: true },
    { field: 'email', header: 'อีเมล', sortable: true },
  ];

  protected readonly menuItems: MenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.router.navigate(['/user-management/detail']) },
    { label: 'แก้ไข', command: () => this.router.navigate(['/user-management/edit']) },
    { label: 'เปลี่ยนรหัสผ่าน', command: () => {} },
    { separator: true },
    { label: 'ลบ', command: () => this.showRemoveDialog.set(true) },
  ];

  protected onActionClick(event: MouseEvent): void {
    event.stopPropagation();
    this.actionMenu().toggle(event);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected onRemoveConfirmed(): void {
    this.removing.set(true);
    this.removing.set(false);
    this.showRemoveDialog.set(false);
  }
}
