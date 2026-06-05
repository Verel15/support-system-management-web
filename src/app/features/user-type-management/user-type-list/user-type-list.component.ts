import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Select } from 'primeng/select';
import { DataTableCellDirective, DataTableComponent, TableColumn } from '../../../shared/components/data-table';
import { DeleteConfirmDialogComponent } from '../../../shared/components/dialogs';
import { MenuItem, MessageService, SortEvent } from 'primeng/api';
import { Router } from '@angular/router';

interface UserType {
  typeName: string;
  amountUser: string;
  craetedBy: string;
  updateBy: string;
  updatedAt: string;
  createdAt: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-user-type-list',
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
  templateUrl: './user-type-list.component.html',
})
export class UserTypeListComponent {
  private readonly router = inject(Router);
  private messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingUser = signal<UserType | null>(null);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewUser() },
    { label: 'แก้ไข', command: () => this.onEditUser() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeleteUser() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'typeName', header: 'ประเภท', sortable: true },
    { field: 'amountUser', header: 'จำนวนผู้ใช้', sortable: true },
    { field: 'updatedAt', header: 'วันที่แก้ไขล่าสุด', sortable: true }
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

  private readonly allUserTypes: UserType[] = [
    {
      typeName: 'ลูกค้า',
      amountUser: '10',
      craetedBy: 'แอดมิน',
      updateBy: 'แอดมิน',
      updatedAt: '2022-01-01',
      createdAt: '2022-01-01',
    },
    {
      typeName: 'ผู้พัฒนา',
      amountUser: '12',
      craetedBy: 'แอดมิน',
      updateBy: 'แอดมิน',
      updatedAt: '2022-01-01',
      createdAt: '2022-01-01',
    },
    { 
      typeName: 'แอดมินภายนอก', 
      amountUser: '1', 
      craetedBy: 'แอดมิน',
      updateBy: 'แอดมิน',
      updatedAt: '2022-01-01',
      createdAt: '2022-01-01',
    },
    {
      typeName: 'ผู้พัฒนาภายนอก',
      amountUser: '3',
      craetedBy: 'แอดมิน',
      updateBy: 'แอดมิน',
      updatedAt: '2022-01-01',
      createdAt: '2022-01-01',
    },
    { 
      typeName: 'แอดมิน3', 
      amountUser: '4', 
      craetedBy: 'แอดมิน',
      updateBy: 'แอดมิน',
      updatedAt: '2022-01-01',
      createdAt: '2022-01-01',
    },
    {
      typeName: 'แอดมิน2',
      amountUser: '7',
      craetedBy: 'แอดมิน',
      updateBy: 'แอดมิน',
      updatedAt: '2022-01-01',
      createdAt: '2022-01-01',
    },
    { 
      typeName: 'แอดมิน', 
      amountUser: '3', 
      craetedBy: 'แอดมิน',
      updateBy: 'แอดมิน',
      updatedAt: '2022-01-01',
      createdAt: '2022-01-01',
    }
  ];

  protected readonly filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const type = this.selectedUserType();
    return this.allUserTypes.filter((u) => {
      const matchesSearch =
        !query || u.typeName.toLowerCase().includes(query) || u.amountUser.toLowerCase().includes(query);
      const matchesType = !type || u.amountUser.toLowerCase() === type.toLowerCase();
      return matchesSearch && matchesType;
    });
  });

  protected readonly totalRecords = computed(() => this.filteredUsers().length);

  protected readonly pagedUsers = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredUsers()
      .slice(start, start + this.pageSize())
      .map((u) => ({ ...u }));
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

  protected onAddUserType(): void {
    this.router.navigate(['/user-type-management/add']);
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row);
    this.menu().toggle(event);
  }

  protected onViewUser(): void {
    this.router.navigate(['/user-management/detail']);
  }
  protected onEditUser(): void {
    this.router.navigate(['/user-management/edit']);
  }

  protected onDeleteUser(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingUser.set(row as unknown as UserType);
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
