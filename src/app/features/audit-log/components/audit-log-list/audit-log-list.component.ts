import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, map, of, startWith, Subject, switchMap } from 'rxjs';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
  SortEvent,
} from '../../../../shared/components/data-table';
import { AuditLogService } from '../../services/audit-log.service';
import {
  AuditLogAction,
  AuditLogDateRange,
  AuditLogModule,
  AuditLogPageResponse,
  AuditLogResponse,
} from '../../interfaces/audit-log.interface';
import { formatDateTimeShort } from '../../../../shared/utils/date-format.util';
import { AuditLogDetailDialogComponent } from '../audit-log-detail-dialog/audit-log-detail-dialog.component';
import { AuditLogTrendChartComponent } from '../audit-log-trend-chart/audit-log-trend-chart.component';

@Component({
  selector: 'app-audit-log-list',
  imports: [
    FormsModule,
    Select,
    InputText,
    IconField,
    InputIcon,
    Tag,
    DataTableComponent,
    DataTableCellDirective,
    AuditLogDetailDialogComponent,
    AuditLogTrendChartComponent,
  ],
  templateUrl: './audit-log-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogListComponent {
  private readonly auditLogService = inject(AuditLogService);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly searchQuery = signal('');
  protected readonly selectedModule = signal<AuditLogModule | null>(null);
  protected readonly selectedAction = signal<AuditLogAction | null>(null);
  protected readonly selectedDate = signal<AuditLogDateRange | null>(null);
  protected readonly selectedLogId = signal<string | null>(null);
  protected readonly showDetailDialog = signal(false);

  private readonly search$ = new Subject<string>();

  protected readonly columns: TableColumn[] = [
    { field: 'createdAt', header: 'เวลา', sortable: true, width: '160px' },
    { field: 'actorName', header: 'ผู้ทำรายการ', width: '160px' },
    { field: 'moduleLabel', header: 'โมดูล', width: '140px' },
    { field: 'actionLabel', header: 'การกระทำ', width: '120px' },
    { field: 'description', header: 'รายละเอียด' },
    { field: 'targetLabel', header: 'เป้าหมาย', width: '160px' },
    { field: 'ipAddress', header: 'IP Address', width: '130px' },
  ];

  protected readonly moduleOptions: { label: string; value: AuditLogModule | null }[] = [
    { label: 'โมดูลทั้งหมด', value: null },
    { label: 'Ticket', value: 'TICKET' },
    { label: 'โครงการ', value: 'PROJECT' },
    { label: 'ผู้ใช้', value: 'USER' },
    { label: 'บริษัท', value: 'COMPANY' },
    { label: 'สถานะ', value: 'STATUS_FLOW' },
    { label: 'ประเภท Ticket', value: 'TICKET_TYPE' },
    { label: 'ระดับความสำคัญ', value: 'PRIORITY' },
    { label: 'คลังความรู้ (FAQ)', value: 'FAQ' },
    { label: 'การยืนยันตัวตน', value: 'AUTH' },
  ];

  protected readonly actionOptions: { label: string; value: AuditLogAction | null }[] = [
    { label: 'การกระทำทั้งหมด', value: null },
    { label: 'สร้าง', value: 'CREATE' },
    { label: 'แก้ไข', value: 'UPDATE' },
    { label: 'ลบ', value: 'DELETE' },
    { label: 'เข้าสู่ระบบ', value: 'LOGIN' },
    { label: 'ออกจากระบบ', value: 'LOGOUT' },
    { label: 'ส่งออกข้อมูล', value: 'EXPORT' },
  ];

  protected readonly dateOptions: { label: string; value: AuditLogDateRange | null }[] = [
    { label: 'ทุกช่วงเวลา', value: null },
    { label: 'วันนี้', value: 'TODAY' },
    { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
    { label: 'เดือนนี้', value: 'THIS_MONTH' },
  ];

  private readonly queryParams = computed(() => ({
    page: this.currentPage() - 1,
    size: this.pageSize(),
    keyword: this.searchQuery(),
    module: this.selectedModule(),
    action: this.selectedAction(),
    dateRange: this.selectedDate(),
  }));

  protected readonly pageData = signal<AuditLogPageResponse | null>(null);
  protected readonly loading = signal(false);

  constructor() {
    this.search$.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
    });

    toObservable(this.queryParams)
      .pipe(
        switchMap((query) =>
          this.auditLogService.getAll(query).pipe(
            map((data) => ({ data, loading: false })),
            startWith({ data: null as AuditLogPageResponse | null, loading: true }),
            catchError(() => of({ data: null as AuditLogPageResponse | null, loading: false })),
          ),
        ),
      )
      .subscribe(({ data, loading }) => {
        this.pageData.set(data);
        this.loading.set(loading);
      });
  }

  protected readonly tableRows = computed<Record<string, unknown>[]>(() =>
    (this.pageData()?.content ?? []).map((r) => ({
      ...r,
      actorName: r.actor.name,
      moduleLabel: this.moduleLabel(r.module),
      actionLabel: this.actionLabel(r.action),
      targetLabel: r.targetLabel ?? '-',
      createdAt: formatDateTimeShort(r.createdAt),
    })),
  );

  protected readonly totalRecords = computed(() => this.pageData()?.totalElements ?? 0);

  protected moduleLabel(module: AuditLogModule): string {
    return this.moduleOptions.find((o) => o.value === module)?.label ?? module;
  }

  protected actionLabel(action: AuditLogAction): string {
    return this.actionOptions.find((o) => o.value === action)?.label ?? action;
  }

  protected actionSeverity(action: AuditLogAction): 'success' | 'info' | 'danger' | 'warn' | 'secondary' {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'LOGIN':
        return 'secondary';
      case 'LOGOUT':
        return 'secondary';
      case 'EXPORT':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  protected onSearch(value: string): void {
    this.search$.next(value);
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

  protected onRowClick(row: Record<string, unknown>): void {
    const log = row as unknown as AuditLogResponse;
    this.selectedLogId.set(log.id);
    this.showDetailDialog.set(true);
  }
}
