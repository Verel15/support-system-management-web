import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ChipComponent } from '../../../../shared/components/chip';
import { DeleteConfirmDialogComponent } from '../../../../shared/components/dialogs';

interface UserDetail {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  company: string;
  userType: string;
  phone: string;
  createdAt: string;
  department: string;
  position: string;
  email: string;
  projects: { name: string }[];
}

@Component({
  selector: 'app-user-detail',
  imports: [Menu, ChipComponent, DeleteConfirmDialogComponent],
  templateUrl: './user-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  private readonly router = inject(Router);
  protected readonly actionMenu = viewChild.required<Menu>('actionMenu');
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  protected readonly menuItems: MenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', command: () => this.showDeleteDialog.set(true) },
  ];

  protected readonly user = signal<UserDetail>({
    firstName: 'ยิ้มสวย',
    lastName: 'มากเลย',
    company: 'TEA MO NE CO., LTD.',
    userType: 'ผู้พัฒนา',
    phone: '000-000-0000',
    createdAt: '16/08/2023',
    department: 'Development',
    position: 'Front-end',
    email: 'sddwad@gmail.com',
    projects: [
      { name: 'Book Bank System' },
      { name: 'Life Insurance System' },
      { name: 'Rent a car System' },
      { name: 'IT Supporting and Helpdesk Management System' },
      { name: 'Manage Pharmacy System' },
    ],
  });

  protected readonly fullName = computed(
    () => `${this.user().firstName} ${this.user().lastName}`,
  );

  protected onBack(): void {
    this.router.navigate(['/user-management/list']);
  }

  protected onMoreMenu(event: MouseEvent): void {
    this.actionMenu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/user-management/edit']);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.deleting.set(true);
    // TODO: call delete API
    this.deleting.set(false);
    this.onBack();
  }
}
