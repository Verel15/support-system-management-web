import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../../shared/components/dialogs';
import {
  DataTableComponent,
  TableColumn,
} from '../../../../../shared/components/data-table';
import { TicketSubCategoryService } from '../../../services/ticket-sub-category.service';
import {
  TicketSubCategoryResponse,
  TicketSummaryResponse,
} from '../../../interfaces/ticket-type.interface';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-sub-category-detail',
  imports: [Button, Menu, ConfirmDialogComponent, DeleteConfirmDialogComponent, DataTableComponent],
  templateUrl: './sub-category-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubCategoryDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly ticketSubCategoryService = inject(TicketSubCategoryService);

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);
  protected readonly subCategory = signal<TicketSubCategoryResponse | null>(null);

  protected readonly tickets = signal<any[]>([]);
  protected readonly ticketTotal = signal(0);
  protected readonly ticketPage = signal(0);
  protected readonly ticketPageSize = signal(10);
  protected readonly ticketLoading = signal(false);

  protected readonly ticketRows = computed(() => this.tickets() as Record<string, unknown>[]);

  protected readonly ticketColumns: TableColumn[] = [
    { field: 'title', header: 'หัวข้องาน', sortable: true },
    { field: 'projectName', header: 'โครงการ', sortable: true },
    { field: 'assigneeName', header: 'ผู้รับผิดชอบ', sortable: true },
    { field: 'teamName', header: 'ทีมรับเรื่อง', sortable: true },
  ];

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข Sub-Category', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDialog.set(true) },
  ];

  constructor() {
    this.loadData();
    this.loadTickets();
  }

  private loadData(): void {
    this.ticketSubCategoryService.getById(this.id).subscribe({
      next: (res) => this.subCategory.set(res),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลได้',
          life: 4000,
        });
        this.router.navigate(['/ticket-type-management/list']);
      },
    });
  }

  private loadTickets(): void {
    this.ticketLoading.set(true);
    this.ticketSubCategoryService
      .getTickets(this.id, this.ticketPage(), this.ticketPageSize())
      .subscribe({
        next: (res) => {
          this.tickets.set(res.content);
          this.ticketTotal.set(res.totalElements);
          this.ticketLoading.set(false);
        },
        error: () => {
          this.ticketLoading.set(false);
        },
      });
  }

  protected onTicketPageChange(page: number): void {
    this.ticketPage.set(page);
    this.loadTickets();
  }

  protected onTicketPageSizeChange(size: number): void {
    this.ticketPageSize.set(size);
    this.ticketPage.set(0);
    this.loadTickets();
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  protected formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/ticket-type-management/sub-category/edit', this.id]);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.deleting.set(true);
    this.ticketSubCategoryService.delete(this.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบ Sub-Category เรียบร้อยแล้ว',
          life: 4000,
        });
        this.router.navigate(['/ticket-type-management/list']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบข้อมูลได้',
          life: 4000,
        });
        this.deleting.set(false);
      },
    });
  }
}
