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
import { TicketTypeService } from '../../services/ticket-type.service';
import { TicketCategoryService } from '../../services/ticket-category.service';
import { TicketSubCategoryService } from '../../services/ticket-sub-category.service';
import {
  TicketTypeResponse,
  TicketCategoryResponse,
  TicketSubCategoryResponse,
} from '../../interfaces/ticket-type.interface';

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

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onView() },
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDelete() },
  ];

  protected readonly ticketTypeColumns: TableColumn[] = [
    { field: 'name', header: 'ประเภท Ticket', sortable: true },
    { field: 'createdAt', header: 'วันที่สร้าง', sortable: true },
  ];

  protected readonly categoryColumns: TableColumn[] = [
    { field: 'name', header: 'หมวดหมู่', sortable: true },
    { field: 'statusFlowName', header: 'Status Flow', sortable: true },
    { field: 'subCategoryCount', header: 'จำนวน Sub-Category', sortable: true },
    { field: 'createdAt', header: 'วันที่สร้าง', sortable: true },
  ];

  protected readonly subCategoryColumns: TableColumn[] = [
    { field: 'name', header: 'หมวดหมู่ย่อย', sortable: true },
    { field: 'priorityLevelName', header: 'ลำดับความสำคัญ', sortable: true },
    { field: 'positionName', header: 'ตำแหน่งที่เกี่ยวข้อง', sortable: true },
  ];

  protected readonly dateOptions = [
    { label: 'ทั้งหมด', value: null },
    { label: 'วันนี้', value: 'today' },
    { label: 'สัปดาห์นี้', value: 'week' },
    { label: 'เดือนนี้', value: 'month' },
  ];

  protected readonly selectedDate = signal<string | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  private readonly allTicketTypes = signal<TicketTypeResponse[]>([]);
  private readonly allCategories = signal<TicketCategoryResponse[]>([]);
  private readonly allSubCategories = signal<TicketSubCategoryResponse[]>([]);

  constructor() {
    this.loadTicketTypes();
    this.loadCategories();
    this.loadSubCategories();
  }

  private loadTicketTypes(): void {
    this.loading.set(true);
    this.ticketTypeService.getAll(0, 1000).subscribe({
      next: (res) => {
        this.allTicketTypes.set(res.content);
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
  }

  private loadCategories(): void {
    this.ticketCategoryService.getAll(0, 1000).subscribe({
      next: (res) => this.allCategories.set(res.content),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล Category ได้',
          life: 4000,
        }),
    });
  }

  private loadSubCategories(): void {
    this.ticketSubCategoryService.getAll(0, 1000).subscribe({
      next: (res) => this.allSubCategories.set(res.content),
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล Sub-Category ได้',
          life: 4000,
        }),
    });
  }

  private formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private readonly filteredTicketTypes = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.allTicketTypes().filter((item) => !query || item.name.toLowerCase().includes(query));
  });

  private readonly filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.allCategories().filter((item) => !query || item.name.toLowerCase().includes(query));
  });

  private readonly filteredSubCategories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.allSubCategories().filter(
      (item) => !query || item.name.toLowerCase().includes(query),
    );
  });

  protected readonly currentColumns = computed<TableColumn[]>(() => {
    const tab = this.activeTab();
    if (tab === 'ticket-type') return this.ticketTypeColumns;
    if (tab === 'category') return this.categoryColumns;
    return this.subCategoryColumns;
  });

  protected readonly totalRecords = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ticket-type') return this.filteredTicketTypes().length;
    if (tab === 'category') return this.filteredCategories().length;
    return this.filteredSubCategories().length;
  });

  protected readonly currentData = computed<Record<string, unknown>[]>(() => {
    const tab = this.activeTab();
    const start = (this.currentPage() - 1) * this.pageSize();

    if (tab === 'ticket-type') {
      return this.filteredTicketTypes()
        .slice(start, start + this.pageSize())
        .map((item) => ({
          id: item.id,
          name: item.name,
          createdAt: this.formatDate(item.createdAt),
        }));
    }
    if (tab === 'category') {
      return this.filteredCategories()
        .slice(start, start + this.pageSize())
        .map((item) => ({
          id: item.id,
          name: item.name,
          statusFlowName: item.statusFlowName,
          subCategoryCount: item.subCategories.length,
          createdAt: this.formatDate(item.createdAt),
        }));
    }
    return this.filteredSubCategories()
      .slice(start, start + this.pageSize())
      .map((item) => ({
        id: item.id,
        name: item.name,
        priorityLevelName: item.priorityLevelName,
        positionName: item.positionName,
      }));
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
    this.currentPage.set(1);
  }

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
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

  protected onDeleteConfirmed(_password: string): void {
    const id = this.activeRow()?.['id'] as string;
    if (!id) return;
    this.deleting.set(true);

    const tab = this.activeTab();
    const delete$ =
      tab === 'ticket-type'
        ? this.ticketTypeService.delete(id)
        : tab === 'category'
          ? this.ticketCategoryService.delete(id)
          : this.ticketSubCategoryService.delete(id);

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
        if (tab === 'ticket-type') this.loadTicketTypes();
        else if (tab === 'category') this.loadCategories();
        else this.loadSubCategories();
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
