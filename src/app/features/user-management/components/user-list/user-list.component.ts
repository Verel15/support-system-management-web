import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
  SortEvent,
} from '../../../../shared/components/data-table';
import { DeleteConfirmDialogComponent } from '../../../../shared/components/dialogs';
import { UserService } from '../../services/user.service';
import { AccountType, UserFilterRequest } from '../../interfaces/user.interface';
import { PageResponse } from '../../interfaces/position.interface';
import { UserResponse } from '../../interfaces/user.interface';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

interface UserRow {
  id: string;
  name: string;
  userType: string;
  email: string;
  phone: string;
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
  private readonly userService = inject(UserService);

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<UserRow | null>(null);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingEmail = signal('');
  private readonly deletingId = signal<string | null>(null);
  private readonly refreshTrigger = signal(0);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewUser() },
    { label: 'แก้ไข', command: () => this.onEditUser() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeleteUser() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'รายชื่อ', sortable: true },
    { field: 'userType', header: 'ประเภทผู้ใช้', sortable: true },
    { field: 'email', header: 'อีเมล', sortable: true },
    { field: 'phone', header: 'เบอร์โทรศัพท์' },
  ];

  protected readonly accountTypeOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'ลูกค้า', value: 'CUSTOMER' as AccountType },
    { label: 'บุคคลภายนอก', value: 'EXTERNAL' as AccountType },
  ];

  protected readonly dateOptions = [
    { label: 'วันที่สร้าง (ทั้งหมด)', value: null },
    { label: 'วันนี้', value: 1 },
    { label: '7 วันที่แล้ว', value: 7 },
    { label: '30 วันที่แล้ว', value: 30 },
  ];

  protected readonly selectedAccountType = signal<AccountType | null>(null);
  protected readonly selectedDate = signal<number | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  private readonly queryParams = computed(() => ({
    filter: {
      accountType: this.selectedAccountType() ?? undefined,
      keyword: this.searchQuery() || undefined,
      createdWithinDays: this.selectedDate() ?? undefined,
    } satisfies UserFilterRequest,
    page: this.currentPage() - 1,
    size: this.pageSize(),
    _refresh: this.refreshTrigger(),
  }));

  private readonly response = toSignal(
    toObservable(this.queryParams).pipe(
      debounceTime(250),
      switchMap(({ filter, page, size }) =>
        this.userService.getAll(filter, page, size).pipe(
          map((data) => ({ data, loading: false })),
          startWith({ data: null as PageResponse<UserResponse> | null, loading: true }),
          catchError(() => of({ data: null as PageResponse<UserResponse> | null, loading: false })),
        ),
      ),
      startWith({ data: null as PageResponse<UserResponse> | null, loading: true }),
    ),
  );

  protected readonly loading = computed(() => this.response()?.loading ?? true);

  protected readonly pagedUsers = computed<Record<string, unknown>[]>(() =>
    (this.response()?.data?.content ?? []).map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      userType: u.userTypeName,
      email: u.email,
      phone: u.phone ?? '-',
    })),
  );

  protected readonly totalRecords = computed(
    () => this.response()?.data?.totalElements ?? 0,
  );

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
    this.activeRow.set(row as unknown as UserRow);
    this.menu().toggle(event);
  }

  protected onViewUser(): void {
    const id = this.activeRow()?.id;
    if (id) this.router.navigate(['/user-management/detail', id]);
  }

  protected onEditUser(): void {
    const id = this.activeRow()?.id;
    if (id) this.router.navigate(['/user-management/edit', id]);
  }

  protected onDeleteUser(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingId.set(row.id);
    this.deletingEmail.set(row.email);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    const id = this.deletingId();
    if (!id) return;
    this.userService.delete(id).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.deletingId.set(null);
        this.refreshTrigger.update((n) => n + 1);
      },
    });
  }
}
