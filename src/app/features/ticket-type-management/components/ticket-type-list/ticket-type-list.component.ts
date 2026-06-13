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

type TabType = 'ticket-type' | 'category' | 'sub-category';
type Priority = 'น้อย' | 'ปานกลาง' | 'มาก';

interface TicketTypeItem {
  name: string;
  createdBy: string;
  ticketCount: number;
  createdDate: string;
}

interface CategoryItem {
  name: string;
  createdBy: string;
  subCategoryCount: number;
  createdDate: string;
}

interface SubCategoryItem {
  name: string;
  priority: Priority;
  relatedPosition: string;
}

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
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingItem = signal<string | null>(null);
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
    { field: 'createdBy', header: 'สร้างโดย', sortable: true },
    { field: 'ticketCount', header: 'จำนวน Tickets ที่ใช้', sortable: true },
    { field: 'createdDate', header: 'วันที่สร้าง', sortable: true },
  ];

  protected readonly categoryColumns: TableColumn[] = [
    { field: 'name', header: 'หมวดหมู่', sortable: true },
    { field: 'createdBy', header: 'สร้างโดย', sortable: true },
    { field: 'subCategoryCount', header: 'จำนวน Sub-Category', sortable: true },
    { field: 'createdDate', header: 'วันที่สร้าง', sortable: true },
  ];

  protected readonly subCategoryColumns: TableColumn[] = [
    { field: 'name', header: 'หมวดหมู่ย่อย', sortable: true },
    { field: 'priority', header: 'ลำดับความสำคัญ', sortable: true },
    { field: 'relatedPosition', header: 'ตำแหน่งที่เกี่ยวข้อง', sortable: true },
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

  private readonly allTicketTypes: TicketTypeItem[] = [
    { name: 'Network Issue', createdBy: 'สมชาย ใจดี', ticketCount: 42, createdDate: '2026-06-01' },
    {
      name: 'Software Bug',
      createdBy: 'วิภาวรรณ สวัสดี',
      ticketCount: 18,
      createdDate: '2026-06-02',
    },
    {
      name: 'Hardware Failure',
      createdBy: 'ใจงาม สุดใจจริง',
      ticketCount: 7,
      createdDate: '2026-06-03',
    },
    {
      name: 'Access Request',
      createdBy: 'แสนดี ที่สุดเลย',
      ticketCount: 25,
      createdDate: '2026-06-04',
    },
    {
      name: 'Security Incident',
      createdBy: 'มานี มีตา',
      ticketCount: 15,
      createdDate: '2026-06-05',
    },
  ];

  private readonly allCategories: CategoryItem[] = [
    { name: 'Network', createdBy: 'สมชาย ใจดี', subCategoryCount: 8, createdDate: '2026-06-01' },
    {
      name: 'Software',
      createdBy: 'วิภาวรรณ สวัสดี',
      subCategoryCount: 12,
      createdDate: '2026-06-02',
    },
    {
      name: 'Hardware',
      createdBy: 'ใจงาม สุดใจจริง',
      subCategoryCount: 5,
      createdDate: '2026-06-03',
    },
    {
      name: 'Security',
      createdBy: 'แสนดี ที่สุดเลย',
      subCategoryCount: 6,
      createdDate: '2026-06-04',
    },
    {
      name: 'Infrastructure',
      createdBy: 'มานี มีตา',
      subCategoryCount: 9,
      createdDate: '2026-06-05',
    },
  ];

  private readonly allSubCategories: SubCategoryItem[] = [
    { name: 'Network Design', priority: 'น้อย', relatedPosition: 'Back-end' },
    { name: 'Network Configuration', priority: 'ปานกลาง', relatedPosition: 'Back-end' },
    { name: 'Network Security', priority: 'มาก', relatedPosition: 'Back-end' },
    { name: 'Network Monitoring', priority: 'น้อย', relatedPosition: 'Back-end' },
    { name: 'Network Troubleshooting', priority: 'ปานกลาง', relatedPosition: 'Back-end' },
    { name: 'Network Performance', priority: 'น้อย', relatedPosition: 'Back-end' },
    { name: 'Network Infrastructure', priority: 'มาก', relatedPosition: 'Back-end' },
    { name: 'Network Connectivity', priority: 'น้อย', relatedPosition: 'Back-end' },
    { name: 'Software Usage', priority: 'มาก', relatedPosition: 'Back-end' },
    { name: 'Printer Not Working', priority: 'ปานกลาง', relatedPosition: 'Back-end' },
  ];

  private readonly filteredTicketTypes = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.allTicketTypes.filter((item) => !query || item.name.toLowerCase().includes(query));
  });

  private readonly filteredCategories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.allCategories.filter((item) => !query || item.name.toLowerCase().includes(query));
  });

  private readonly filteredSubCategories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.allSubCategories.filter(
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
    let source: (TicketTypeItem | CategoryItem | SubCategoryItem)[];
    if (tab === 'ticket-type') source = this.filteredTicketTypes();
    else if (tab === 'category') source = this.filteredCategories();
    else source = this.filteredSubCategories();
    return source
      .slice(start, start + this.pageSize())
      .map((item) => ({ ...item }) as Record<string, unknown>);
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

  protected prioritySymbol(priority: unknown): string {
    if (priority === 'มาก') return '▲';
    if (priority === 'ปานกลาง') return '●';
    return '▼';
  }

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
    this.router.navigate([`/ticket-type-management/${this.activeTab()}/detail`]);
  }

  protected onEdit(): void {
    this.router.navigate([`/ticket-type-management/${this.activeTab()}/edit`]);
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
    this.messageService.add({
      severity: 'success',
      summary: 'ลบสำเร็จ',
      detail: 'ลบรายการเรียบร้อยแล้ว',
      life: 4000,
    });
    this.deletingItem.set(null);
  }
}
