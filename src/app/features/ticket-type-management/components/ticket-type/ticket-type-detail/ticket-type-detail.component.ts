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
import {
  ConfirmDialogComponent,
  DeleteConfirmDialogComponent,
} from '../../../../../shared/components/dialogs';

interface TicketTypeDetail {
  name: string;
  categories: string[];
  createdDate: string;
  createdTime: string;
  createdBy: string;
}

interface ActionMenuItem extends MenuItem {
  danger?: boolean;
}

@Component({
  selector: 'app-ticket-type-detail',
  imports: [Button, Menu, ConfirmDialogComponent, DeleteConfirmDialogComponent],
  templateUrl: './ticket-type-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketTypeDetailComponent {
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  protected readonly menu = viewChild.required<Menu>('actionMenu');
  protected readonly showConfirmDialog = signal(false);
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  // TODO: receive via route params / service
  protected readonly ticketType = signal<TicketTypeDetail>({
    name: 'Incident',
    categories: ['System', 'Security'],
    createdDate: '18/07/2566',
    createdTime: '14:30',
    createdBy: 'ชื่อ นามสกุล',
  });

  protected readonly menuItems: ActionMenuItem[] = [
    { label: 'แก้ไขประเภท', command: () => this.onEdit() },
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
    this.router.navigate(['/ticket-type-management/ticket-type/edit']);
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
      detail: 'ลบประเภท Ticket เรียบร้อยแล้ว',
      life: 4000,
    });
    this.router.navigate(['/ticket-type-management/list']);
    this.deleting.set(false);
  }
}
