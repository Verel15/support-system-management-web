import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
} from '../../../../shared/components/data-table';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../shared/components/dialogs';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import {
  type PriorityIconKey,
  type PriorityColorKey,
  ICON_CLASSES,
  COLOR_HEX,
  SHAPE_TO_ICON_KEY,
  COLOR_TO_COLOR_KEY,
  findDurationValue,
  DURATION_OPTIONS,
} from '../../interfaces/priority.interface';
import { PriorityService } from '../../services/priority.service';
import { TicketService } from '../../../ticket-management/services/ticket.service';
import { TicketListResponse } from '../../../ticket-management/interfaces/ticket.interface';
import { formatDateFull } from '../../../../shared/utils/date-format.util';

interface PriorityData {
  name: string;
  icon: PriorityIconKey;
  color: PriorityColorKey;
  duration: string;
  createdAt: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-priority-detail',
  imports: [
    Button,
    Menu,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
    StatusChipComponent,
  ],
  templateUrl: './priority-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly priorityService = inject(PriorityService);
  private readonly ticketService = inject(TicketService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);
  protected readonly loading = signal(true);
  protected readonly ticketsLoading = signal(false);

  protected readonly priority = signal<PriorityData>({
    name: '',
    icon: 'circle',
    color: 'blue',
    duration: '',
    createdAt: '',
  });

  protected readonly ticketColumns: TableColumn[] = [
    { field: 'title', header: 'หัวข้อ Ticket', sortable: true },
    { field: 'projectName', header: 'โครงการ', sortable: true },
    { field: 'assigneesDisplay', header: 'ผู้รับผิดชอบ' },
    { field: 'statusFlowName', header: 'StatusFlow' },
    { field: 'currentStatusName', header: '' },
  ];

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalTickets = signal(0);
  protected readonly tickets = signal<TicketListResponse[]>([]);

  protected readonly pagedTickets = computed<Record<string, unknown>[]>(() =>
    this.tickets().map((t) => ({
      ...t,
      assigneesDisplay:
        t.assignees.length > 0 ? t.assignees.map((a) => a.fullName).join(', ') : '-',
    })),
  );

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDialog.set(true) },
  ];

  constructor() {
    this.loadPriority();
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.ticketsLoading.set(true);
    this.ticketService
      .getAll({ priorityId: this.id }, this.currentPage() - 1, this.pageSize())
      .subscribe({
        next: (res) => {
          this.tickets.set(res.content);
          this.totalTickets.set(res.totalElements);
          this.ticketsLoading.set(false);
        },
        error: () => {
          this.ticketsLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถโหลดรายการ Ticket ได้',
            life: 4000,
          });
        },
      });
  }

  private loadPriority(): void {
    this.priorityService.getById(this.id).subscribe({
      next: (res) => {
        const durationLabel =
          DURATION_OPTIONS.find(
            (d) =>
              d.value === findDurationValue(res.intervalValue, res.intervalUnit),
          )?.label ?? `${res.intervalValue} ${res.intervalUnit}`;

        this.priority.set({
          name: res.name,
          icon: SHAPE_TO_ICON_KEY[res.iconShape],
          color: COLOR_TO_COLOR_KEY[res.iconColor],
          duration: durationLabel,
          createdAt: formatDateFull(res.createdAt),
        });
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลลำดับความสำคัญได้',
          life: 4000,
        });
        this.router.navigate(['/ticket-priority-management/list']);
      },
    });
  }

  protected iconClass(icon: PriorityIconKey): string {
    return ICON_CLASSES[icon];
  }

  protected colorHex(color: PriorityColorKey): string {
    return COLOR_HEX[color];
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

  protected onBack(): void {
    this.router.navigate(['/ticket-priority-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/ticket-priority-management/edit', this.id]);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(password: string): void {
    this.deleting.set(true);
    this.priorityService.delete(this.id, password).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบลำดับความสำคัญเรียบร้อยแล้ว',
          life: 4000,
        });
        this.router.navigate(['/ticket-priority-management/list']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบลำดับความสำคัญได้',
          life: 4000,
        });
        this.deleting.set(false);
      },
    });
  }
}
