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
import { MenuItem } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { formatDate } from '@angular/common';
import { ChipComponent } from '../../../../shared/components/chip';
import { DeleteConfirmDialogComponent } from '../../../../shared/components/dialogs';
import { UserService } from '../../services/user.service';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private readonly userId = this.route.snapshot.params['id'] as string;

  protected readonly actionMenu = viewChild.required<Menu>('actionMenu');
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleting = signal(false);

  protected readonly menuItems: MenuItem[] = [
    { label: 'แก้ไข', command: () => this.onEdit() },
    { separator: true },
    { label: 'ลบ', command: () => this.showDeleteDialog.set(true) },
  ];

  private readonly rawUser = toSignal(
    this.userService.getById(this.userId).pipe(catchError(() => of(null))),
  );

  protected readonly user = computed<UserDetail | null>(() => {
    const u = this.rawUser();
    if (!u) return null;
    return {
      firstName: u.firstName,
      lastName: u.lastName,
      avatarUrl: u.profileImageUrl || undefined,
      company: u.companyName ?? '',
      userType: u.userTypeName ?? '',
      phone: u.phone ?? '-',
      createdAt: formatDate(u.createdAt, 'dd/MM/yyyy', 'en-US'),
      department: u.departmentName ?? '',
      position: u.positionName ?? '',
      email: u.email,
      projects: [],
    };
  });

  protected readonly fullName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  protected onBack(): void {
    this.router.navigate(['/user-management/list']);
  }

  protected onMoreMenu(event: MouseEvent): void {
    this.actionMenu().toggle(event);
  }

  protected onEdit(): void {
    this.router.navigate(['/user-management/edit', this.userId]);
  }

  protected onDeleteConfirmed(_password: string): void {
    this.deleting.set(true);
    this.userService.delete(this.userId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(['/user-management/list']);
      },
      error: () => this.deleting.set(false),
    });
  }
}
