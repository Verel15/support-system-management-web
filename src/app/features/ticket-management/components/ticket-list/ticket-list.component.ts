import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
  SortEvent,
} from '../../../../shared/components/data-table';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { HasPermissionDirective } from '../../../../shared/directives';
import { TicketService } from '../../services/ticket.service';
import { ReportService } from '../../services/report.service';
import { AuthStore } from '../../../authentication/store/auth.store';
import {
  ExportReportDialogComponent,
  ExportScope,
} from '../export-report-dialog/export-report-dialog.component';
import { PdfPreviewDialogComponent } from '../pdf-preview-dialog/pdf-preview-dialog.component';
import { ReportExportRequest, ReportFilterRequest } from '../../interfaces/report.interface';
import {
  TicketListResponse,
  PriorityResponse,
  PriorityIconColor,
  TicketFilterRequest,
  TicketRemainingTime,
  TicketStatusGroup,
  TICKET_STATUS_OPTIONS,
  TICKET_TIME_OPTIONS,
  buildPriorityOptions,
} from '../../interfaces/ticket.interface';

@Component({
  selector: 'app-ticket-list',
  imports: [
    FormsModule,
    Button,
    Select,
    InputText,
    IconField,
    InputIcon,
    DataTableComponent,
    DataTableCellDirective,
    StatusChipComponent,
    HasPermissionDirective,
    ExportReportDialogComponent,
    PdfPreviewDialogComponent,
  ],
  templateUrl: './ticket-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly ticketService = inject(TicketService);
  private readonly reportService = inject(ReportService);
  private readonly messageService = inject(MessageService);
  private readonly authStore = inject(AuthStore);

  protected readonly statusFilter = signal<string | null>(null);
  protected readonly priorityFilter = signal<string | null>(null);
  protected readonly timeFilter = signal<TicketRemainingTime | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly tickets = signal<TicketListResponse[]>([]);
  protected readonly priorities = signal<PriorityResponse[]>([]);
  protected readonly showExportDialog = signal(false);
  protected readonly exporting = signal(false);
  protected readonly showPdfPreview = signal(false);
  protected readonly pdfPreviewUrl = signal<string | null>(null);
  private pdfPreviewBlob: Blob | null = null;

  // EXTERNAL (staff) may export any company; CUSTOMER locked to their own.
  protected readonly exportScope = computed<ExportScope>(() => {
    const user = this.authStore.user();
    return {
      canSelectAllCompanies: !!user && user.accountType === 'EXTERNAL',
      lockedCompanyId: user?.companyId ?? null,
    };
  });

  protected readonly currentReportFilter = computed<ReportFilterRequest>(() => {
    const filter: ReportFilterRequest = {};
    if (this.priorityFilter()) filter.priorityId = this.priorityFilter()!;
    if (this.statusFilter()) filter.statusGroup = this.statusFilter() as TicketStatusGroup;
    return filter;
  });

  protected readonly statusOptions = TICKET_STATUS_OPTIONS;

  protected readonly priorityOptions = computed(() => buildPriorityOptions(this.priorities()));

  protected readonly timeOptions = TICKET_TIME_OPTIONS;

  protected readonly columns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', maxWidth: '300px' },
    { field: 'projectName', header: 'โครงการ' },
    { field: 'assigneesDisplay', header: 'ผู้รับผิดชอบ' },
    { field: 'remainingTime', header: 'ระยะเวลาที่เหลือ' },
    { field: 'statusFlowName', header: 'StatusFlow' },
    { field: 'priorityName', header: 'ลำดับความสำคัญ' },
    { field: 'currentStatusName', header: 'สถานะ' },
  ];

  protected readonly tableData = computed<Record<string, unknown>[]>(() =>
    this.tickets().map((t) => ({
      ...t,
      assigneesDisplay:
        t.assignees.length > 0 ? t.assignees.map((a) => a.fullName).join(', ') : '-',
      dueDateDisplay: t.dueDate ? this.formatDueDate(t.dueDate) : '-',
    })),
  );

  ngOnInit(): void {
    this.loadPriorities();
    this.loadTickets();
  }

  private loadPriorities(): void {
    this.ticketService.getPriorities().subscribe({
      next: (res) => this.priorities.set(res.content),
      error: () => {},
    });
  }

  private loadTickets(): void {
    this.loading.set(true);
    const filter: TicketFilterRequest = {};
    if (this.searchQuery().trim()) filter.keyword = this.searchQuery().trim();
    if (this.priorityFilter()) filter.priorityId = this.priorityFilter()!;
    if (this.statusFilter()) filter.statusGroup = this.statusFilter() as TicketFilterRequest['statusGroup'];
    if (this.timeFilter()) filter.remainingTime = this.timeFilter()!;

    this.ticketService.getAll(filter, this.currentPage() - 1, this.pageSize()).subscribe({
      next: (res) => {
        this.tickets.set(res.content);
        this.totalRecords.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดรายการ Ticket ได้',
          life: 3000,
        });
      },
    });
  }

  protected onFilterChange(): void {
    this.currentPage.set(1);
    this.loadTickets();
  }

  protected onTimeFilterChange(value: TicketRemainingTime | null): void {
    this.timeFilter.set(value);
    this.onFilterChange();
  }

  protected onSort(_event: SortEvent): void {
    this.currentPage.set(1);
    this.loadTickets();
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTickets();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadTickets();
  }

  protected onAddTicket(): void {
    this.router.navigate(['/ticket-management/add']);
  }

  protected onExportConfirm(request: ReportExportRequest): void {
    this.exporting.set(true);
    this.reportService.export(request).subscribe({
      next: (blob) => {
        this.exporting.set(false);
        if (request.format === 'pdf') {
          this.showExportDialog.set(false);
          this.openPdfPreview(blob);
        } else {
          this.showExportDialog.set(false);
          this.downloadFile(blob, request.format);
        }
      },
      error: () => {
        this.exporting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถ Export รายงานได้',
          life: 3000,
        });
      },
    });
  }

  private openPdfPreview(blob: Blob): void {
    this.pdfPreviewBlob = blob;
    this.pdfPreviewUrl.set(URL.createObjectURL(blob));
    this.showPdfPreview.set(true);
  }

  protected onPdfPreviewDownload(): void {
    if (!this.pdfPreviewBlob) return;
    this.downloadFile(this.pdfPreviewBlob, 'pdf');
    this.closePdfPreview();
  }

  protected onPdfPreviewCancel(): void {
    this.closePdfPreview();
  }

  private closePdfPreview(): void {
    this.showPdfPreview.set(false);
    const url = this.pdfPreviewUrl();
    if (url) URL.revokeObjectURL(url);
    this.pdfPreviewUrl.set(null);
    this.pdfPreviewBlob = null;
  }

  private downloadFile(blob: Blob, format: ReportExportRequest['format']): void {
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-report.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected onViewTicketRow(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.router.navigate(['/ticket-management/detail', row['id']]);
  }

  protected getPriorityIconClass(row: Record<string, unknown>): string {
    const shape = row['priorityIconShape'] as string;
    const color = row['priorityIconColor'] as PriorityIconColor;
    if (!shape || !color) return '';
    const colorClass = this.priorityColorClass(color);
    const iconClass = this.priorityShapeIcon(shape);
    return `${iconClass} ${colorClass}`;
  }

  private priorityShapeIcon(shape: string): string {
    switch (shape) {
      case 'ARROWUP':
      case 'CHEVRONUP':
      case 'TRIUP':
        return 'pi pi-caret-up';
      case 'ARROWDOWN':
      case 'CHEVRONDOWN':
      case 'TRIDOWN':
        return 'pi pi-caret-down';
      case 'CIRCLE':
        return 'pi pi-circle-fill';
      default:
        return 'pi pi-minus';
    }
  }

  private priorityColorClass(color: PriorityIconColor): string {
    switch (color) {
      case 'RED':
        return 'text-error-600';
      case 'ORANGE':
        return 'text-orange-500';
      case 'YELLOW':
        return 'text-warning-500';
      case 'LIME':
      case 'GREEN':
        return 'text-primary-500';
      case 'BLUE':
        return 'text-blue-500';
      case 'PINK':
        return 'text-pink-500';
      default:
        return 'text-slate-400';
    }
  }

  private formatDueDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `เกินกำหนด ${Math.abs(days)} วัน`;
    if (days === 0) return '0 วัน';
    return `${days} วัน`;
  }
}
