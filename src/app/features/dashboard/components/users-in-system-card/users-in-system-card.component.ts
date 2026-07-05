import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import {
  DataTableCellDirective,
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table';
import { UserService } from '../../../user-management/services/user.service';
import { PageResponse } from '../../../user-management/interfaces/position.interface';
import { AccountType, UserResponse } from '../../../user-management/interfaces/user.interface';

@Component({
  selector: 'app-users-in-system-card',
  imports: [
    FormsModule,
    IconField,
    InputIcon,
    InputText,
    Select,
    DataTableComponent,
    DataTableCellDirective,
  ],
  templateUrl: './users-in-system-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersInSystemCardComponent {
  private readonly userService = inject(UserService);

  protected readonly accountTypeOptions = [
    { label: 'รูปแบบผู้ใช้', value: null },
    { label: 'ลูกค้า', value: 'CUSTOMER' as AccountType },
    { label: 'บุคคลภายนอก', value: 'EXTERNAL' as AccountType },
  ];

  protected readonly dateOptions = [
    { label: 'วันที่สร้าง', value: null },
    { label: 'วันนี้', value: 'TODAY' },
    { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
    { label: 'เดือนนี้', value: 'THIS_MONTH' },
  ];

  protected readonly selectedAccountType = signal<AccountType | null>(null);
  protected readonly selectedDate = signal<number | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'ผู้รับผิดชอบ' },
    { field: 'type', header: 'ประเภท' },
    { field: 'accountType', header: 'รูปแบบผู้ใช้'},
    { field: 'ticketCount', header: 'จำนวน Tickets ที่ถือ' },
    { field: 'email', header: 'อีเมล' },
  ];

  private readonly queryParams = computed(() => ({
    accountType: this.selectedAccountType() ?? undefined,
    keyword: this.searchQuery() || undefined,
    dateRange: this.selectedDate() ?? undefined,
    page: this.currentPage() - 1,
    size: this.pageSize(),
  }));

  private readonly response = toSignal(
    toObservable(this.queryParams).pipe(
      debounceTime(250),
      switchMap(({ accountType, keyword, dateRange, page, size }) =>
        this.userService.getAll({ accountType, keyword, dateRange }, page, size).pipe(
          map((data) => ({ data, loading: false })),
          startWith({ data: null as PageResponse<UserResponse> | null, loading: true }),
          catchError(() => of({ data: null as PageResponse<UserResponse> | null, loading: false })),
        ),
      ),
      startWith({ data: null as PageResponse<UserResponse> | null, loading: true }),
    ),
  );

  protected readonly loading = computed(() => this.response()?.loading ?? true);

  protected readonly rows = computed<Record<string, unknown>[]>(() =>
    (this.response()?.data?.content ?? []).map((u) => ({
      name: `${u.firstName} ${u.lastName}`,
      type: u.userTypeName,
      accountType: this.accountTypeMap[u.accountType],
      ticketCount: '0',
      email: u.email,
    })),
  );

  protected readonly accountTypeMap = {
    'CUSTOMER': 'ลูกค้า',
    'EXTERNAL': 'บุคคลภายนอก',
  };

  protected readonly totalRecords = computed(() => this.response()?.data?.totalElements ?? 0);

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }
}
