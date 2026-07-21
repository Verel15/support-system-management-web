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
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { HasPermissionDirective } from '../../../../shared/directives';
import {
  FAQ_DATE_OPTIONS,
  FAQ_PUBLISH_STATUS_OPTIONS,
  FaqDateRange,
} from '../../interfaces/faq.interface';
import { FaqService } from '../../services/faq.service';
import { formatDateTimeShort } from '../../../../shared/utils/date-format.util';
import { AuthStore } from '../../../authentication/store/auth.store';
import { PERMISSIONS } from '../../../../core/constants/permission.constant';

interface Faq {
  id: string;
  question: string;
  category: string;
  publishLabel: string;
  createdAt: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-faq-list',
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
    StatusChipComponent,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
    HasPermissionDirective,
  ],
  templateUrl: './faq-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqListComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly faqService = inject(FaqService);
  private readonly authStore = inject(AuthStore);

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingFaq = signal<Faq | null>(null);
  protected readonly deleting = signal(false);

  protected readonly menuItems = computed<ActionMenuItem[]>(() => {
    const items: ActionMenuItem[] = [{ label: 'ดูรายละเอียด', command: () => this.onViewFaq() }];
    if (this.authStore.hasPermission()(PERMISSIONS.MANAGE_DATA_ACCESS)) {
      items.push(
        { label: 'แก้ไข', command: () => this.onEditFaq() },
        { separator: true },
        { label: 'ลบ', danger: true, command: () => this.onDeleteFaq() },
      );
    }
    return items;
  });

  protected readonly columns: TableColumn[] = [
    { field: 'question', header: 'คำถาม', sortable: true },
    { field: 'category', header: 'หมวดหมู่' },
    { field: 'publishLabel', header: 'สถานะ' },
    { field: 'createdAt', header: 'วันที่สร้าง', sortable: true },
  ];

  protected readonly dateOptions = FAQ_DATE_OPTIONS;
  protected readonly publishStatusOptions = FAQ_PUBLISH_STATUS_OPTIONS;

  protected readonly selectedDate = signal<FaqDateRange | null>(null);
  protected readonly selectedPublishStatus = signal<boolean | null>(null);
  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);
  protected readonly totalRecords = signal(0);
  protected readonly pagedFaqs = signal<Record<string, unknown>[]>([]);

  private readonly search$ = new Subject<string>();

  constructor() {
    this.search$.pipe(debounceTime(300)).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
    });

    effect(() => {
      this.loadFaqs(
        this.currentPage(),
        this.pageSize(),
        this.searchQuery(),
        this.selectedPublishStatus(),
        this.selectedDate(),
      );
    });
  }

  private loadFaqs(
    page: number,
    size: number,
    keyword: string,
    published: boolean | null,
    dateRange: FaqDateRange | null,
  ): void {
    this.loading.set(true);
    this.faqService.getAll(page - 1, size, keyword, null, published, dateRange).subscribe({
      next: (res) => {
        this.pagedFaqs.set(
          res.content.map((f) => ({
            id: f.id,
            question: f.question,
            category: f.category,
            publishLabel: f.published ? 'เผยแพร่แล้ว' : 'แบบร่าง',
            createdAt: formatDateTimeShort(f.createdAt),
          })),
        );
        this.totalRecords.set(res.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูล FAQ ได้',
          life: 4000,
        });
        this.loading.set(false);
      },
    });
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

  protected onAdd(): void {
    this.router.navigate(['/faq-management/add']);
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row);
    this.menu().toggle(event);
  }

  protected onViewFaq(): void {
    const id = this.activeRow()?.['id'] as string;
    if (!id) return;
    this.router.navigate(['/faq-management/detail', id]);
  }

  protected onEditFaq(): void {
    const id = this.activeRow()?.['id'] as string;
    if (!id) return;
    this.router.navigate(['/faq-management/edit', id]);
  }

  protected onDeleteFaq(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingFaq.set(row as unknown as Faq);
    this.showConfirmDialog.set(true);
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(password: string): void {
    const id = this.deletingFaq()?.id;
    if (!id) return;
    this.deleting.set(true);
    this.faqService.delete(id, password).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'ลบสำเร็จ',
          detail: 'ลบบทความ FAQ เรียบร้อยแล้ว',
          life: 4000,
        });
        this.showDeleteDialog.set(false);
        this.deletingFaq.set(null);
        this.deleting.set(false);
        this.loadFaqs(
          this.currentPage(),
          this.pageSize(),
          this.searchQuery(),
          this.selectedPublishStatus(),
          this.selectedDate(),
        );
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถลบบทความ FAQ ได้',
          life: 4000,
        });
        this.deleting.set(false);
      },
    });
  }
}
