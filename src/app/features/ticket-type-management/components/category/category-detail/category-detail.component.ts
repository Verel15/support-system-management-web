import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { Select } from 'primeng/select';
import { MenuItem, MessageService } from 'primeng/api';
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../../shared/components/dialogs';

interface CategoryDetail {
  name: string;
  subCategories: string[];
  createdDate: string;
  createdTime: string;
  createdBy: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-category-detail',
  imports: [FormsModule, Button, Menu, Select, ConfirmDialogComponent, DeleteConfirmDialogComponent],
  templateUrl: './category-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  // TODO: receive via route params / service
  protected readonly category = signal<CategoryDetail>({
    name: 'Network',
    subCategories: [
      'Network Design',
      'Network Configuration',
      'Network Security',
      'Network Monitoring',
      'Network Troubleshooting',
    ],
    createdDate: 'วันจันทร์ที่ 3 ก.ค. 2566',
    createdTime: '15:30',
    createdBy: 'ชื่อ นามสกุล',
  });

  protected readonly selectedStatus = signal<string>('active');

  protected readonly statusOptions = [
    { value: 'active', label: 'ใช้งาน' },
    { value: 'inactive', label: 'ไม่ใช้งาน' },
  ];

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข Category', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showConfirmDialog.set(true) },
  ];

  protected onBack(): void {
    this.router.navigate(['/ticket-type-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/ticket-type-management/category/edit']);
  }

  protected onStatusChange(value: string): void {
    this.selectedStatus.set(value);
    // TODO: call update status API
    this.messageService.add({
      severity: 'success',
      summary: 'บันทึกสำเร็จ',
      detail: 'อัปเดตสถานะเรียบร้อยแล้ว',
      life: 3000,
    });
  }

  protected onDeleteFirstStepConfirmed(): void {
    this.showConfirmDialog.set(false);
    this.showDeleteDialog.set(true);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.deleting.set(true);
    // TODO: call delete API with _password
    this.messageService.add({
      severity: 'success',
      summary: 'ลบสำเร็จ',
      detail: 'ลบ Category เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-type-management/list']);
    this.deleting.set(false);
  }
}
