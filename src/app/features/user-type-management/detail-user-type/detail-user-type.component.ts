import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table';
import { ConfirmDialogComponent, DeleteConfirmDialogComponent } from '../../../shared/components/dialogs';

interface UserTypeDetail {
  typeName: string;
  myTickets: 'customer' | 'admin' | 'none';
  allProjects: 'yes' | 'none';
  notifications: 'yes' | 'none';
  dashboard: 'yes' | 'none';
  allTickets: 'yes' | 'none';
  projectManagement: 'yes' | 'none';
  userManagement: 'yes' | 'none';
  companyManagement: 'yes' | 'none';
  dataManagement: 'yes' | 'none';
}

@Component({
  selector: 'app-detail-user-type',
  imports: [Menu, DataTableComponent, ConfirmDialogComponent, DeleteConfirmDialogComponent],
  templateUrl: './detail-user-type.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailUserTypeComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  protected readonly actionMenu = viewChild.required<Menu>('actionMenu');

  protected readonly showConfirmDeleteDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  protected readonly columns: TableColumn[] = [
    { field: 'access', header: 'การเข้าถึง' },
    { field: 'permission', header: 'สิทธิ์ในการเข้าถึงผู้ใช้' },
  ];

  protected readonly menuItems: MenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.onDelete() },
  ];

  private readonly mockData: UserTypeDetail[] = [
    { typeName: 'ลูกค้า', myTickets: 'customer', allProjects: 'none', notifications: 'yes', dashboard: 'none', allTickets: 'none', projectManagement: 'none', userManagement: 'none', companyManagement: 'none', dataManagement: 'none' },
    { typeName: 'ผู้พัฒนา', myTickets: 'customer', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'yes', companyManagement: 'yes', dataManagement: 'yes' },
    { typeName: 'แอดมินภายนอก', myTickets: 'admin', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'none', companyManagement: 'none', dataManagement: 'none' },
    { typeName: 'ผู้พัฒนาภายนอก', myTickets: 'customer', allProjects: 'yes', notifications: 'yes', dashboard: 'none', allTickets: 'none', projectManagement: 'yes', userManagement: 'none', companyManagement: 'none', dataManagement: 'none' },
    { typeName: 'แอดมิน3', myTickets: 'admin', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'yes', companyManagement: 'none', dataManagement: 'none' },
    { typeName: 'แอดมิน2', myTickets: 'admin', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'yes', companyManagement: 'yes', dataManagement: 'none' },
    { typeName: 'แอดมิน', myTickets: 'admin', allProjects: 'yes', notifications: 'yes', dashboard: 'yes', allTickets: 'yes', projectManagement: 'yes', userManagement: 'yes', companyManagement: 'yes', dataManagement: 'yes' },
  ];

  protected readonly typeName = signal(
    this.route.snapshot.paramMap.get('typeName') ?? ''
  );

  protected readonly userType = computed(() =>
    this.mockData.find((u) => u.typeName === this.typeName()) ?? null
  );

  protected readonly permissionRows = computed<Record<string, unknown>[]>(() => {
    const u = this.userType();
    if (!u) return [];
    return [
      { access: 'หน้า Ticket ของฉัน', permission: this.myTicketsLabel(u.myTickets) },
      { access: 'หน้าโครงการของฉัน', permission: this.pageLabel('หน้าโครงการของฉัน', u.allProjects) },
      { access: 'หน้าการแจ้งเตือน', permission: this.pageLabel('หน้าการแจ้งเตือน', u.notifications) },
      { access: 'หน้าแดชบอร์ด', permission: this.pageLabel('หน้าแดชบอร์ด', u.dashboard) },
      { access: 'หน้า Ticket ทั้งหมด', permission: this.pageLabel('หน้า Ticket ทั้งหมด', u.allTickets) },
      { access: 'หน้าจัดการโครงการ', permission: this.pageLabel('หน้าจัดการโครงการ', u.projectManagement) },
      { access: 'หน้าจัดการผู้ใช้', permission: this.pageLabel('หน้าจัดการผู้ใช้', u.userManagement) },
      { access: 'หน้าจัดการบริษัท', permission: this.pageLabel('หน้าจัดการบริษัท', u.companyManagement) },
      { access: 'หน้าจัดการข้อมูล', permission: this.pageLabel('หน้าจัดการข้อมูล', u.dataManagement) },
    ];
  });

  private myTicketsLabel(value: string): string {
    if (value === 'customer') return 'สามารถดูรายละเอียด เพิ่ม และแก้ไข Ticket';
    if (value === 'admin') return 'สามารถดูรายละเอียด เพิ่ม แก้ไข และลบ Ticket';
    return 'ไม่มีสิทธิ์เข้าถึงหน้า Ticket ของฉัน';
  }

  private pageLabel(pageName: string, value: string): string {
    return value === 'yes'
      ? `มีสิทธิ์เข้าถึง${pageName}`
      : `ไม่มีสิทธิ์เข้าถึง${pageName}`;
  }

  protected onToggleMenu(event: MouseEvent): void {
    this.actionMenu().toggle(event);
  }

  protected onBack(): void {
    this.router.navigate(['/user-type-management/list']);
  }

  protected onEdit(): void {
    this.router.navigate(['/user-type-management/edit', this.typeName()]);
  }

  protected onDelete(): void {
    this.showConfirmDeleteDialog.set(true);
  }

  protected onConfirmDelete(): void {
    this.showConfirmDeleteDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.deleting.set(true);
    // TODO: call delete API
    this.messageService.add({
      severity: 'success',
      summary: 'สำเร็จ',
      detail: 'ลบประเภทผู้ใช้เรียบร้อยแล้ว',
      life: 4000,
    });
    this.deleting.set(false);
    this.router.navigate(['/user-type-management/list']);
  }
}
