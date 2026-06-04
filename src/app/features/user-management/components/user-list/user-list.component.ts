import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { DataTableComponent, DataTableCellDirective, TableColumn, SortEvent } from '../../../../shared/components/data-table';
import { DeleteConfirmDialogComponent } from '../../../../shared/components/dialogs';

interface User {
  name: string;
  userType: string;
  email: string;
  phone: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-user-list',
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
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  private readonly router = inject(Router);
  private messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingUser = signal<User | null>(null);
  
  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewUser() },
    { label: 'แก้ไข', command: () => this.onEditUser() },
    { label: 'เปลี่ยนรหัสผ่าน', command: () => this.onChangePassword() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeleteUser() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'รายชื่อ', sortable: true },
    { field: 'userType', header: 'ประเภทผู้ใช้', sortable: true },
    { field: 'email', header: 'อีเมล', sortable: true },
    { field: 'phone', header: 'เบอร์โทรศัพท์', sortable: true },
  ];

  protected readonly userTypeOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'แอดมิน', value: 'แอดมิน' },
    { label: 'ลูกค้า', value: 'ลูกค้า' },
    { label: 'ผู้พัฒนา', value: 'ผู้พัฒนา' },
  ];

  protected readonly dateOptions = [
    { label: 'วันที่สร้าง', value: null },
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
  ];

  protected readonly selectedUserType = signal<string | null>(null);
  protected readonly selectedDate = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  private readonly allUsers: User[] = [
    { name: 'ใจงาม สุดใจจริง', userType: 'แอดมิน', email: 'Jaiknam@gmail.com', phone: '012-345-6789' },
    { name: 'แสนดี ที่สุดเลย', userType: 'ลูกค้า', email: 'Sansee@gmail.com', phone: '012-345-6789' },
    { name: 'มานี มีตา', userType: 'ผู้พัฒนา', email: 'Manee@gmail.com', phone: '012-345-6789' },
    { name: 'ตุ๊กตุ๊ก ตุ๊กแก', userType: 'ผู้พัฒนา', email: 'Tuktuk@gmail.com', phone: '012-345-6789' },
    { name: 'สิริ สวัสดิ', userType: 'ผู้พัฒนา', email: 'Siri@gmail.com', phone: '012-345-6789' },
    { name: 'มีดัง ต้นเตือน', userType: 'ผู้พัฒนา', email: 'Metung@gmail.com', phone: '012-345-6789' },
    { name: 'ชูใจ ใจดี', userType: 'ผู้พัฒนา', email: 'Shujai@gmail.com', phone: '012-345-6789' },
    { name: 'ปิติ ยินดี', userType: 'ลูกค้า', email: 'Piti@gmail.com', phone: '012-345-6789' },
    { name: 'แก้ว ดิ้นน้ำ', userType: 'ผู้พัฒนา', email: 'Kwaw@gmail.com', phone: '012-345-6789' },
    { name: 'มะลิลา ขึ้นต้นเป็นมะลิซ้อน', userType: 'ผู้พัฒนา', email: 'Malila@gmail.com', phone: '012-345-6789' },
    { name: 'สมชาย ใจดี', userType: 'แอดมิน', email: 'Somchai@gmail.com', phone: '012-345-6789' },
    { name: 'วิภาวรรณ สวัสดี', userType: 'ลูกค้า', email: 'Wipawan@gmail.com', phone: '012-345-6789' },
  ];

  protected readonly filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const type = this.selectedUserType();
    return this.allUsers.filter(u => {
      const matchesSearch =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);
      const matchesType = !type || u.userType === type;
      return matchesSearch && matchesType;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredUsers().length);

  protected readonly pagedUsers = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsers()
      .slice(start, start + this.pageSize())
      .map(u => ({ ...u }));
  });

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected onSort(_event: SortEvent): void {
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  protected onAddUser(): void {
    this.router.navigate(['/user-management/add']);
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row);
    this.menu().toggle(event);
  }

  protected onViewUser(): void {
    this.router.navigate(['/user-management/detail']);
  }
  protected onEditUser(): void { }
  protected onChangePassword(): void { }

  protected onDeleteUser(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingUser.set(row as unknown as User);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    // TODO: call delete API with this.deletingUser() and _password
    this.messageService.add({
      severity: 'success',
      summary: 'เพิ่มผู้ใช้สำเร็จ',
      detail: 'สร้างผู้ใช้ใหม่เรียบร้อยแล้ว',
      life: 4000,
    });
    this.deletingUser.set(null);

  }
}
