import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import {
  DataTableComponent,
  DataTableCellDirective,
  TableColumn,
  SortEvent,
} from '../../../../shared/components/data-table';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../shared/components/dialogs';
import { HasPermissionDirective } from '../../../../shared/directives';
import { TicketTypeService } from '../../services/ticket-type.service';
import { TicketCategoryService } from '../../services/ticket-category.service';
import { TicketSubCategoryService } from '../../services/ticket-sub-category.service';
import { TicketTypeDateRange } from '../../interfaces/ticket-type.interface';
import { formatDateShort } from '../../../../shared/utils/date-format.util';
import { AuthStore } from '../../../authentication/store/auth.store';
import { PERMISSIONS } from '../../../../core/constants/permission.constant';

type TabType = 'ticket-type' | 'category' | 'sub-category';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-ticket-type-list',
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
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
    HasPermissionDirective,
  ],
  templateUrl: './ticket-type-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTypeListComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly ticketTypeService = inject(TicketTypeService);
  private readonly ticketCategoryService = inject(TicketCategoryService);
  private readonly ticketSubCategoryService = inject(TicketSubCategoryService);
  private readonly authStore = inject(AuthStore);

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingItem = signal<string | null>(null);
  protected readonly deleting = signal(false);
  protected readonly activeTab = signal<TabType>('ticket-type');

  protected readonly tabs: { label: string; value: TabType }[] = [
    { label: 'Ticket Type', value: 'ticket-type' },
    { label: 'Category', value: 'category' },
    { label: 'Sub-Category', value: 'sub-category' },
  ];

  protected readonly menuItems = computed<ActionMenuItem[]>(() => {
    const items: ActionMenuItem[] = [{ label: 'ดูรายละเอียด', command: () => this.onView() }];
    if (this.authStore.hasPermission()(PERMISSIONS.MANAGE_DATA_ACCESS)) {
      items.push(
        { label: 'แก้ไข', command: () => this.onEdit() },
        { separator: true },
        { label: 'ลบ', danger: true, command: () => this.onDelete() },
      );
    }
    return items;
  });

  protected readonly ticketTypeColumns: TableColumn[] = [
    { field: 'name', header: 'ประเภท Ticket' },
    { field: 'createdAt', header: 'วันที่สร้าง' },
  ];

  protected readonly categoryColumns: TableColumn[] = [
    { field: 'name', header: 'หมวดหมู่' },
    { field: 'statusFlowName', header: 'Status Flow' },
    { field: 'subCategoryCount', header: 'จำนวน Sub-Category' },
    { field: 'createdAt', header: 'วันที่สร้าง' },
  ];

  protected readonly subCategoryColumns: TableColumn[] = [
    { field: 'name', header: 'หมวดหมู่ย่อย' },
    { field: 'priorityLevelName', header: 'ลำดับความสำคัญ' },
    { field: 'positionName', header: 'ตำแหน่งที่เกี่ยวข้อง' },
  ];

  protected readonly dateOptions: { label: string; value: TicketTypeDateRange | null }[] = [
    { label: 'วันที่สร้าง', value: null },
    { label: 'วันนี้', value: 'TODAY' },
    { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
    { label: 'เดือนนี้', value: 'THIS_MONTH' },
  ];

  protected readonly selectedDate = signal<TicketTypeDateRange | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly currentData = signal<Record<string, unknown>[]>([]);

  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
    });

    effect(() => {
      this.loadCurrentTab(
        this.activeTab(),
        this.currentPage(),
        this.pageSize(),
        this.searchQuery(),
        this.selectedDate(),
      );
    });
  }

  private loadCurrentTab(
    tab: TabType,
    page: number,
    size: number,
    keyword: string,
    dateRange: TicketTypeDateRange | null,
  ): void {
    this.loading.set(true);

    if (tab === 'ticket-type') {
      this.ticketTypeService.getAll(page - 1, size, keyword, dateRange).subscribe({
        next: (res) => {
          this.totalRecords.set(res.totalElements);
          this.currentData.set(
            res.content.map((item) => ({
              id: item.id,
              name: item.name,
              createdAt: formatDateShort(item.createdAt),
            })),
          );
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถโหลดข้อมูล Ticket Type ได้',
            life: 4000,
          });
          this.loading.set(false);
        },
      });
      return;
    }

    if (tab === 'category') {
      this.ticketCategoryService.getAll(page - 1, size, keyword, dateRange).subscribe({
        next: (res) => {
          this.totalRecords.set(res.totalElements);
          this.currentData.set(
            res.content.map((item) => ({
              id: item.id,
              name: item.name,
              statusFlowName: item.statusFlowName,
              subCategoryCount: item.subCategories.length,
              createdAt: formatDateShort(item.createdAt),
            })),
          );
          this.loading.set(false);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'เกิดข้อผิดพลาด',
            detail: 'ไม่สามารถโหลดข้อมูล Category ได้',
            life: 4000,
          });
          this.loading.set(false);
        },
      });
      return;
    }

    this.ticketSubCategoryService.getAll(page - 1, size, keyword, dateRange).subscribe({
      next: (res) => {
        this.totalRecords.set(res.totalElements);
        this.currentData.set(
          res.content.map((item) => ({
            id: item.id,
            name: item.name,
            priorityLevelName: item.priorityLevelName,
            positionName: item.positionName,
          })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล Sub-Category ได้',
          life: 4000,
        });
        this.loading.set(false);
      },
    });
  }

  private reload(): void {
    this.loadCurrentTab(
      this.activeTab(),
      this.currentPage(),
      this.pageSize(),
      this.searchQuery(),
      this.selectedDate(),
    );
  }

  protected readonly currentColumns = computed<TableColumn[]>(() => {
    const tab = this.activeTab();
    if (tab === 'ticket-type') return this.ticketTypeColumns;
    if (tab === 'category') return this.categoryColumns;
    return this.subCategoryColumns;
  });

  protected readonly addButtonLabel = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ticket-type') return 'เพิ่ม Ticket Type';
    if (tab === 'category') return 'เพิ่ม Category';
    return 'เพิ่ม Sub-Category';
  });

  protected readonly searchPlaceholder = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ticket-type') return 'ค้นหาประเภท Ticket';
    if (tab === 'category') return 'ค้นหาหมวดหมู่';
    return 'ค้นหาหมวดหมู่ย่อย';
  });

  protected setActiveTab(tab: TabType): void {
    this.activeTab.set(tab);
    this.searchQuery.set('');
    this.selectedDate.set(null);
    this.currentPage.set(1);
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

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row);
    this.menu().toggle(event);
  }

  protected onAdd(): void {
    this.router.navigate([`/ticket-type-management/${this.activeTab()}/add`]);
  }

  protected onView(): void {
    const id = this.activeRow()?.['id'] as string;
    if (!id) return;
    this.router.navigate([`/ticket-type-management/${this.activeTab()}/detail`, id]);
  }

  protected onEdit(): void {
    const id = this.activeRow()?.['id'] as string;
    if (!id) return;
    this.router.navigate([`/ticket-type-management/${this.activeTab()}/edit`, id]);
  }

  protected onDelete(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingItem.set(row['name'] as string);
    this.showConfirmDialog.set(true);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(password: string): void {
    const id = this.activeRow()?.['id'] as string;
    if (!id) return;
    this.deleting.set(true);

    const tab = this.activeTab();
    const delete$ =
      tab === 'ticket-type'
        ? this.ticketTypeService.delete(id, password)
        : tab === 'category'
          ? this.ticketCategoryService.delete(id, password)
          : this.ticketSubCategoryService.delete(id, password);

    delete$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบรายการเรียบร้อยแล้ว',
          life: 4000,
        });
        this.showDeleteDialog.set(false);
        this.deletingItem.set(null);
        this.deleting.set(false);
        this.reload();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบรายการได้',
          life: 4000,
        });
        this.deleting.set(false);
      },
    });
  }
}
