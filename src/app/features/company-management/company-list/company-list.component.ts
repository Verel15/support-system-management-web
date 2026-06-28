import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService, SortEvent } from 'primeng/api';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { DataTableCellDirective, DataTableComponent, TableColumn } from '../../../shared/components/data-table';
import { ConfirmDialogComponent, DeleteConfirmDialogComponent } from '../../../shared/components/dialogs';
import { CompanyResponse } from '../interfaces/company.interface';
import { CompanyService } from '../services/company.service';

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-company-list',
  imports: [
    FormsModule,
    Button,
    InputText,
    IconField,
    InputIcon,
    Menu,
    DataTableComponent,
    DataTableCellDirective,
    ConfirmDialogComponent,
    DeleteConfirmDialogComponent,
  ],
  templateUrl: './company-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly companyService = inject(CompanyService);

  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<CompanyResponse | null>(null);
  protected readonly showConfirmDeleteDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewCompany() },
    { label: 'แก้ไข', command: () => this.onEditCompany() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeleteCompany() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'name', header: 'รายชื่อบริษัท', sortable: true },
    { field: 'countProject', header: 'จำนวนโครงการ', sortable: true },
    { field: 'countMember', header: 'จำนวนสมาชิก', sortable: true},
    { field: 'createdAt', header: 'วันที่สร้าง', sortable: true },
  ];

  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  private readonly companies = signal<CompanyResponse[]>([]);

  protected readonly filteredCompanies = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.companies().filter(
      (c) => !query || c.name.toLowerCase().includes(query),
    );
  });

  protected readonly totalRecords = computed(() => this.filteredCompanies().length);

  protected readonly pagedCompanies = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredCompanies()
      .slice(start, start + this.pageSize())
      .map((c) => ({ ...c }));
  });

  ngOnInit(): void {
    this.loadCompanies();
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.companyService.getAll().subscribe({
      next: (data) => {
        this.companies.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: 'ไม่สามารถโหลดข้อมูลบริษัทได้',
          life: 4000,
        });
        this.loading.set(false);
      },
    });
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

  protected onAddCompany(): void {
    this.router.navigate(['/company-management/add']);
  }

  protected onMenuOpen(event: MouseEvent, row: Record<string, unknown>): void {
    event.stopPropagation();
    this.activeRow.set(row as unknown as CompanyResponse);
    this.menu().toggle(event);
  }

  protected onViewCompany(): void {
    const row = this.activeRow();
    if (!row) return;
    this.router.navigate(['/company-management/detail', row.id]);
  }

  protected onEditCompany(): void {
    const row = this.activeRow();
    if (!row) return;
    this.router.navigate(['/company-management/edit', row.id]);
  }

  protected onDeleteCompany(): void {
    if (!this.activeRow()) return;
    this.showConfirmDeleteDialog.set(true);
  }

  protected onConfirmDelete(): void {
    this.showConfirmDeleteDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'ลบบริษัทสำเร็จ',
      detail: 'ลบข้อมูลบริษัทเรียบร้อยแล้ว',
      life: 4000,
    });
    this.activeRow.set(null);
    this.showDeleteDialog.set(false);
    this.loadCompanies();
  }
}
