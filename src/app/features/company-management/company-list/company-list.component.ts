import { Component, computed, inject, signal, viewChild } from '@angular/core';
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

interface Company {
  companyName: string;
  projectCount: number;
  memberCount: number;
  createdAt: string;
}

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
})
export class CompanyListComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly activeRow = signal<Record<string, unknown> | null>(null);
  protected readonly showConfirmDeleteDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deletingCompany = signal<Company | null>(null);

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'ดูรายละเอียด', command: () => this.onViewCompany() },
    { label: 'แก้ไข', command: () => this.onEditCompany() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDeleteCompany() },
  ];

  protected readonly columns: TableColumn[] = [
    { field: 'companyName', header: 'รายชื่อบริษัท', sortable: true },
    { field: 'projectCount', header: 'จำนวนโครงการ', sortable: true },
    { field: 'memberCount', header: 'จำนวนสมาชิก', sortable: true },
  ];

  protected readonly searchQuery = signal('');
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly loading = signal(false);

  private readonly allCompanies: Company[] = [
    { companyName: 'บริษัท ทดสอบ จำกัด', projectCount: 5, memberCount: 12, createdAt: '2024-01-15' },
    { companyName: 'บริษัท เทคโนโลยี จำกัด', projectCount: 8, memberCount: 25, createdAt: '2024-02-10' },
    { companyName: 'บริษัท ซอฟต์แวร์ จำกัด', projectCount: 3, memberCount: 7, createdAt: '2024-03-05' },
    { companyName: 'บริษัท ดิจิทัล จำกัด', projectCount: 10, memberCount: 30, createdAt: '2024-04-20' },
    { companyName: 'บริษัท นวัตกรรม จำกัด', projectCount: 2, memberCount: 5, createdAt: '2024-05-01' },
    { companyName: 'บริษัท พัฒนา จำกัด', projectCount: 6, memberCount: 18, createdAt: '2024-06-12' },
    { companyName: 'บริษัท สมาร์ท จำกัด', projectCount: 4, memberCount: 9, createdAt: '2024-07-08' },
  ];

  protected readonly filteredCompanies = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.allCompanies.filter((c) =>
      !query || c.companyName.toLowerCase().includes(query),
    );
  });

  protected readonly totalRecords = computed(() => this.filteredCompanies().length);

  protected readonly pagedCompanies = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredCompanies()
      .slice(start, start + this.pageSize())
      .map((c) => ({ ...c }));
  });

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
    this.activeRow.set(row);
    this.menu().toggle(event);
  }

  protected onViewCompany(): void {
    const row = this.activeRow();
    if (!row) return;
    this.router.navigate(['/company-management/detail', row['companyName']]);
  }

  protected onEditCompany(): void {
    const row = this.activeRow();
    if (!row) return;
    this.router.navigate(['/company-management/edit', row['companyName']]);
  }

  protected onDeleteCompany(): void {
    const row = this.activeRow();
    if (!row) return;
    this.deletingCompany.set(row as unknown as Company);
    this.showConfirmDeleteDialog.set(true);
  }

  protected onConfirmDelete(): void {
    this.showConfirmDeleteDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    // TODO: call delete API with this.deletingCompany() and _password
    this.messageService.add({
      severity: 'success',
      summary: 'ลบบริษัทสำเร็จ',
      detail: 'ลบข้อมูลบริษัทเรียบร้อยแล้ว',
      life: 4000,
    });
    this.deletingCompany.set(null);
  }
}
