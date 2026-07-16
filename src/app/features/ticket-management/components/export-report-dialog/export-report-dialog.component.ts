import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Checkbox } from 'primeng/checkbox';
import { CompanyService } from '../../../company-management/services/company.service';
import { CompanyResponse } from '../../../company-management/interfaces/company.interface';
import { ProjectResponse } from '../../../project-management/interfaces/project.interface';
import { UserService } from '../../../user-management/services/user.service';
import { UserResponse } from '../../../user-management/interfaces/user.interface';
import { TicketService } from '../../services/ticket.service';
import {
  PriorityResponse,
  TicketStatusGroup,
  buildPriorityOptions,
  TICKET_STATUS_OPTIONS,
} from '../../interfaces/ticket.interface';
import {
  DEFAULT_REPORT_FIELDS,
  REPORT_FIELD_OPTIONS,
  ReportExportFormat,
  ReportExportRequest,
  ReportField,
  ReportFilterRequest,
} from '../../interfaces/report.interface';

export interface ExportScope {
  /** false = locked to `lockedCompanyId` (EXTERNAL/CUSTOMER); true = any company (ADMIN/INTERNAL) */
  canSelectAllCompanies: boolean;
  lockedCompanyId: string | null;
}

@Component({
  selector: 'app-export-report-dialog',
  imports: [FormsModule, NgOptimizedImage, Button, Dialog, MultiSelect, Select, DatePicker, Checkbox],
  templateUrl: './export-report-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportReportDialogComponent {
  private readonly companyService = inject(CompanyService);
  private readonly userService = inject(UserService);
  private readonly ticketService = inject(TicketService);

  readonly visible = model(false);
  readonly scope = input.required<ExportScope>();
  readonly baseFilter = input<ReportFilterRequest>({});
  readonly loading = input(false);

  readonly confirmed = output<ReportExportRequest>();
  readonly cancelled = output<void>();

  protected readonly companies = signal<CompanyResponse[]>([]);
  protected readonly projects = signal<ProjectResponse[]>([]);
  protected readonly assignees = signal<UserResponse[]>([]);
  protected readonly priorities = signal<PriorityResponse[]>([]);
  protected readonly selectedCompanyIds = signal<string[]>([]);
  protected readonly selectedProjectIds = signal<string[]>([]);
  protected readonly selectedAssigneeId = signal<string | null>(null);
  protected readonly selectedPriorityId = signal<string | null>(null);
  protected readonly selectedStatusGroup = signal<TicketStatusGroup | null>(null);
  protected readonly selectedDateRange = signal<Date[] | null>(null);
  protected readonly selectedFields = signal<ReportField[]>(DEFAULT_REPORT_FIELDS);
  protected readonly format = signal<ReportExportFormat>('excel');

  protected readonly fieldOptions = REPORT_FIELD_OPTIONS;
  protected readonly statusOptions = [
    { label: 'สถานะทั้งหมด', value: null },
    ...TICKET_STATUS_OPTIONS.slice(1),
  ];
  protected readonly priorityOptions = computed(() => [
    { label: 'ลำดับความสำคัญทั้งหมด', value: null },
    ...buildPriorityOptions(this.priorities()).slice(1),
  ]);
  protected readonly formatOptions = [
    { label: 'Excel', value: 'excel' as ReportExportFormat, icon: '/icons/microsoft-excel.svg' },
    { label: 'PDF', value: 'pdf' as ReportExportFormat, icon: '/icons/pdf.svg' },
  ];

  protected readonly companyOptions = computed(() =>
    this.companies().map((c) => ({ label: c.name, value: c.id })),
  );

  protected readonly projectOptions = computed(() => {
    const companyIds = this.effectiveCompanyIds();
    const projects = companyIds.length
      ? this.projects().filter((p) => companyIds.includes(p.companyId))
      : this.projects();
    return projects.map((p) => ({ label: p.name, value: p.id }));
  });

  protected readonly assigneeOptions = computed(() => [
    { label: 'ผู้รับผิดชอบทั้งหมด', value: null },
    ...this.assignees().map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id })),
  ]);

  // Locked (EXTERNAL/CUSTOMER) always resolves to their own company regardless of UI state.
  protected readonly effectiveCompanyIds = computed(() =>
    this.scope().canSelectAllCompanies
      ? this.selectedCompanyIds()
      : [this.scope().lockedCompanyId].filter((id): id is string => !!id),
  );

  protected readonly canConfirm = computed(() => this.selectedFields().length > 0);

  constructor() {
    effect(() => {
      if (!this.visible()) return;
      this.loadCompanies();
      this.loadProjects();
      this.loadAssignees();
      this.loadPriorities();
      if (!this.scope().canSelectAllCompanies && this.scope().lockedCompanyId) {
        this.selectedCompanyIds.set([this.scope().lockedCompanyId!]);
      } else {
        this.selectedCompanyIds.set([]);
      }
      const base = this.baseFilter();
      this.selectedProjectIds.set(base.projectIds ?? []);
      this.selectedAssigneeId.set(base.assigneeId ?? null);
      this.selectedPriorityId.set(base.priorityId ?? null);
      this.selectedStatusGroup.set(base.statusGroup ?? null);
      this.selectedDateRange.set(
        base.dateFrom ? [new Date(base.dateFrom), base.dateTo ? new Date(base.dateTo) : new Date(base.dateFrom)] : null,
      );
      this.selectedFields.set(DEFAULT_REPORT_FIELDS);
      this.format.set('excel');
    });
  }

  private loadCompanies(): void {
    if (!this.scope().canSelectAllCompanies) return;
    this.companyService.getAll().subscribe({
      next: (res) => this.companies.set(res),
      error: () => {},
    });
  }

  private loadProjects(): void {
    const lockedId = this.scope().lockedCompanyId;
    if (!this.scope().canSelectAllCompanies && lockedId) {
      this.companyService.getProjects(lockedId).subscribe({
        next: (res) => this.projects.set(res),
        error: () => {},
      });
      return;
    }
    this.companyService.getAll().subscribe({
      next: (companies) => {
        if (!companies.length) return;
        forkJoin(companies.map((c) => this.companyService.getProjects(c.id))).subscribe({
          next: (results) => this.projects.set(results.flat()),
          error: () => {},
        });
      },
      error: () => {},
    });
  }

  private loadAssignees(): void {
    this.userService.getAll({}, 0, 100).subscribe({
      next: (res) => this.assignees.set(res.content),
      error: () => {},
    });
  }

  private loadPriorities(): void {
    this.ticketService.getPriorities().subscribe({
      next: (res) => this.priorities.set(res.content),
      error: () => {},
    });
  }

  protected toggleField(field: ReportField, checked: boolean): void {
    this.selectedFields.update((fields) =>
      checked ? [...fields, field] : fields.filter((f) => f !== field),
    );
  }

  protected onCancel(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }

  protected onConfirm(): void {
    if (!this.canConfirm()) return;
    const range = this.selectedDateRange();
    const filter: ReportFilterRequest = {
      ...(range?.[0] ? { dateFrom: range[0].toISOString() } : {}),
      ...(range?.[1] ? { dateTo: range[1].toISOString() } : {}),
      ...(this.selectedAssigneeId() ? { assigneeId: this.selectedAssigneeId()! } : {}),
      ...(this.selectedPriorityId() ? { priorityId: this.selectedPriorityId()! } : {}),
      ...(this.selectedStatusGroup() ? { statusGroup: this.selectedStatusGroup()! } : {}),
    };
    this.confirmed.emit({
      filter,
      companyIds: this.effectiveCompanyIds(),
      projectIds: this.selectedProjectIds(),
      fields: this.selectedFields(),
      format: this.format(),
    });
  }
}
