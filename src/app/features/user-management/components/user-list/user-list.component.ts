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
import { Tabs, TabList, Tab } from 'primeng/tabs';
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
import { HasPermissionDirective } from '../../../../shared/directives';
import { UserService } from '../../services/user.service';
import { AccountType, UserFilterRequest } from '../../interfaces/user.interface';
import { PageResponse } from '../../interfaces/position.interface';
import { UserResponse } from '../../interfaces/user.interface';
import { AuthStore } from '../../../authentication/store/auth.store';
import { PERMISSIONS } from '../../../../core/constants/permission.constant';
import { formatDateShort } from '../../../../shared/utils/date-format.util';
import { CompanyService } from '../../../company-management/services/company.service';
import { UserTypeService } from '../../../user-type-management/services/user-type.service';

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
    Tabs,
    TabList,
    Tab,
    DataTableComponent,
    DataTableCellDirective,
    DeleteConfirmDialogComponent,
    HasPermissionDirective,
  ],
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly companyService = inject(CompanyService);
  private readonly userTypeService = inject(UserTypeService);
  private readonly authStore = inject(AuthStore);

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<UserRow | null>(null);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingEmail = signal('');
  private readonly deletingId = signal<string | null>(null);
  private readonly refreshTrigger = signal(0);

  protected readonly menuItems = computed<ActionMenuItem[]>(() => {
    const items: ActionMenuItem[] = [{ label: 'ดูรายละเอียด', command: () => this.onViewUser() }];
    if (this.authStore.hasPermission()(PERMISSIONS.MANAGE_USER_ACCESS)) {
      items.push(
        { label: 'แก้ไข', command: () => this.onEditUser() },
        { separator: true },
        { label: 'ลบ', danger: true, command: () => this.onDeleteUser() },
      );
    }
    return items;
  });

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'รายชื่อ' },
    { field: 'userType', header: 'ประเภทผู้ใช้' },
    { field: 'accountType', header: 'รูปแบบผู้ใช้' },
    { field: 'email', header: 'อีเมล' },
    { field: 'phone', header: 'เบอร์โทรศัพท์' },
    { field: 'createdAt', header: 'วันที่สร้าง' }
  ];

  protected readonly accountTypeTabs = [
    { label: 'ทั้งหมด', value: 'ALL' },
    { label: 'ลูกค้า', value: 'CUSTOMER' as AccountType },
    { label: 'เจ้าหน้าที่', value: 'STAFF' as AccountType },
    { label: 'ผู้ดูแลระบบ', value: 'ADMIN' as AccountType },
  ];

  protected readonly dateOptions = [
    { label: 'วันที่สร้าง', value: null },
    { label: 'วันนี้', value: 'TODAY' },
    { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
    { label: 'เดือนนี้', value: 'THIS_MONTH' },
  ];

  private readonly companiesRaw = toSignal(
    this.companyService.getAll().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  protected readonly companyOptions = computed(() => [
    { label: 'บริษัททั้งหมด', value: null },
    ...this.companiesRaw().map((c) => ({ label: c.name, value: c.id })),
  ]);

  private readonly userTypesRaw = toSignal(
    this.userTypeService.getAll(0, 200).pipe(
      map((page) => page.content),
      catchError(() => of([])),
    ),
    { initialValue: [] },
  );

  protected readonly userTypeOptions = computed(() => [
    { label: 'ประเภทผู้ใช้ทั้งหมด', value: null },
    ...this.userTypesRaw().map((t) => ({ label: t.name, value: t.id })),
  ]);

  protected readonly selectedAccountType = signal<AccountType | 'ALL'>('ALL');
  protected readonly selectedCompanyId = signal<string | null>(null);
  protected readonly selectedUserTypeId = signal<string | null>(null);
  protected readonly selectedDate = signal<number | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly showCompanyFilter = computed(() =>
    this.selectedAccountType() === 'ALL' || this.selectedAccountType() === 'CUSTOMER',
  );
  protected readonly showUserTypeFilter = computed(() =>
    this.selectedAccountType() === 'ALL' || this.selectedAccountType() === 'STAFF',
  );

  private readonly queryParams = computed(() => {
    const accountType = this.selectedAccountType();
    return {
      filter: {
        accountType: accountType === 'ALL' ? undefined : accountType,
        companyId: this.selectedCompanyId() ?? undefined,
        userTypeId: this.selectedUserTypeId() ?? undefined,
        keyword: this.searchQuery() || undefined,
        dateRange: this.selectedDate() ?? undefined,
      } satisfies UserFilterRequest,
      page: this.currentPage() - 1,
      size: this.pageSize(),
      _refresh: this.refreshTrigger(),
    };
  });

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
      accountType: this.accountTypeMap[u.accountType],
      userType: u.userTypeName,
      email: u.email,
      phone: u.phone ?? '-',
      createdAt: formatDateShort(u.createdAt),
    })),
  );

  protected readonly accountTypeMap = {
    'CUSTOMER': 'ลูกค้า',
    'STAFF': 'เจ้าหน้าที่',
    'ADMIN': 'ผู้ดูแลระบบ'
  };

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

  protected onTabChange(value: string | number | undefined): void {
    this.selectedAccountType.set(value as AccountType | 'ALL');
    this.selectedCompanyId.set(null);
    this.selectedUserTypeId.set(null);
    this.onFilterChange();
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

  protected onDeleteConfirmed(password: string): void {
    const id = this.deletingId();
    if (!id) return;
    this.userService.delete(id, password).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.deletingId.set(null);
        this.refreshTrigger.update((n) => n + 1);
      },
    });
  }
}
