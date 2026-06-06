import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { DeleteConfirmDialogComponent } from '../../../../shared/components/dialogs';

interface StatusDetail {
  name: string;
  updatedDate: string;
  ticketCount: number;
  createdBy: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-status-detail',
  imports: [Button, Menu, Tooltip, DeleteConfirmDialogComponent],
  templateUrl: './status-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusDetailComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  // TODO: receive via route params / service
  protected readonly status = signal<StatusDetail>({
    name: 'EVT-DEV',
    updatedDate: '18/07/66',
    ticketCount: 56,
    createdBy: 'ใจงาม สุดใจจริง',
  });

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', danger: true, command: () => this.showDeleteDialog.set(true) },
  ];

  protected onBack(): void {
    this.router.navigate(['/status-management/list']);
  }

  protected onMenuOpen(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/status-management/edit']);
  }

  protected onDeleteConfirmed(_password: string): void {
    // TODO: call delete API with _password
    this.messageService.add({
      severity: 'success',
      summary: 'ลบสำเร็จ',
      detail: 'ลบสถานะเรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/status-management/list']);
  }
}
