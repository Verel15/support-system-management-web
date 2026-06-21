import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { DataTableComponent, TableColumn } from '../../../../shared/components/data-table';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../shared/components/dialogs';
import { UserTypeService } from '../../services/user-type.service';

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
  private readonly userTypeService = inject(UserTypeService);

  protected readonly actionMenu = viewChild.required<Menu>('actionMenu');

  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';

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

  protected readonly userType = toSignal(
    this.userTypeService.getById(this.id).pipe(catchError(() => of(null))),
  );

  protected readonly typeName = computed(() => this.userType()?.name ?? '');

  protected readonly permissionRows = computed<Record<string, unknown>[]>(() => {
    const u = this.userType();
    if (!u) return [];
    return [
      { access: 'หน้า Ticket ของฉัน', permission: this.myTicketsLabel(u.myTicketAccess) },
      { access: 'หน้าโครงการของฉัน', permission: this.boolLabel('หน้าโครงการของฉัน', u.allProjectAccess) },
      { access: 'หน้าการแจ้งเตือน', permission: this.boolLabel('หน้าการแจ้งเตือน', u.notificationAccess) },
      { access: 'หน้าแดชบอร์ด', permission: this.boolLabel('หน้าแดชบอร์ด', u.dashboardAccess) },
      { access: 'หน้า Ticket ทั้งหมด', permission: this.boolLabel('หน้า Ticket ทั้งหมด', u.allTicketAccess) },
      { access: 'หน้าจัดการโครงการ', permission: this.boolLabel('หน้าจัดการโครงการ', u.manageProjectAccess) },
      { access: 'หน้าจัดการผู้ใช้', permission: this.boolLabel('หน้าจัดการผู้ใช้', u.manageUserAccess) },
      { access: 'หน้าจัดการบริษัท', permission: this.boolLabel('หน้าจัดการบริษัท', u.manageCompanyAccess) },
      { access: 'หน้าจัดการข้อมูล', permission: this.boolLabel('หน้าจัดการข้อมูล', u.manageDataAccess) },
    ];
  });

  private myTicketsLabel(value: string): string {
    if (value === 'CUSTOMER') return 'สามารถดูรายละเอียด เพิ่ม และแก้ไข Ticket';
    if (value === 'ADMIN') return 'สามารถดูรายละเอียด เพิ่ม แก้ไข และลบ Ticket';
    return 'ไม่มีสิทธิ์เข้าถึงหน้า Ticket ของฉัน';
  }

  private boolLabel(pageName: string, value: boolean): string {
    return value ? `มีสิทธิ์เข้าถึง${pageName}` : `ไม่มีสิทธิ์เข้าถึง${pageName}`;
  }

  protected onToggleMenu(event: MouseEvent): void {
    this.actionMenu().toggle(event);
  }

  protected onBack(): void {
    this.router.navigate(['/user-type-management/list']);
  }

  protected onEdit(): void {
    this.router.navigate(['/user-type-management/edit', this.id]);
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
    this.userTypeService.delete(this.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'ลบประเภทผู้ใช้เรียบร้อยแล้ว',
          life: 4000,
        });
        this.router.navigate(['/user-type-management/list']);
      },
      error: () => this.deleting.set(false),
    });
  }
}
