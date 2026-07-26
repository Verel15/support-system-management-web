import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SidebarComponent, SidebarNavItem, SidebarUser } from '../../components/sidebar';
import { CommandPaletteComponent } from '../../components/command-palette';
import { AuthStore } from '../../../features/authentication/store/auth.store';
import { PERMISSIONS } from '../../../core/constants/permission.constant';
import { NotificationService } from '../../../features/notifications/services/notification.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, CommandPaletteComponent, NgOptimizedImage],
  templateUrl: './main-layout.component.html',
  host: {
    class: 'block h-full',
    '(document:keydown)': 'onGlobalKeydown($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly commandPaletteOpen = signal(false);
  protected readonly headerHidden = signal(false);

  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  protected readonly authStore = inject(AuthStore);
  protected readonly unreadCount = signal(0);

  protected onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.commandPaletteOpen.set(true);
    }
  }

  protected onMainScroll(event: Event): void {
    const scrollTop = (event.target as HTMLElement).scrollTop;
    this.headerHidden.set(scrollTop > 0);
  }

  // On lg+ the sidebar is a normal flex child; on mobile it's a fixed drawer
  protected readonly sidebarDrawerClass = computed(() =>
    this.mobileOpen()
      ? 'fixed inset-y-0 left-0 z-30 translate-x-0 transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:translate-x-0'
      : 'fixed inset-y-0 left-0 z-30 -translate-x-full transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:translate-x-0'
  );

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        this.mobileOpen.set(false);
        this.refreshUnreadCount();
      });

    this.refreshUnreadCount();
  }

  private refreshUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => this.unreadCount.set(res.count),
      error: () => this.unreadCount.set(0),
    });
  }

  protected readonly currentUser = computed<SidebarUser>(() => {
    const user = this.authStore.user();
    return {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      role: user?.accountType ?? '',
    };
  });

  // Customer เห็นเฉพาะเมนูส่วนตัว (personalNav) เท่านั้น
  private readonly isCustomer = computed(
    () => this.authStore.user()?.accountType === 'CUSTOMER',
  );

  protected readonly personalNav = computed<SidebarNavItem[]>(() => {
    const count = this.unreadCount();
    return [
      { label: 'Tickets ของฉัน', icon: 'pi-ticket', route: '/my-tickets' },
      { label: 'โครงการของฉัน', icon: 'pi-folder', route: '/my-project' },
      { label: 'คลังความรู้', icon: 'pi-book', route: '/faq' },
      {
        label: 'การแจ้งเตือน',
        icon: 'pi-bell',
        route: '/notifications',
        ...(count > 0 ? { badge: count } : {}),
      },
    ];
  });

  protected readonly mainNav = computed<SidebarNavItem[]>(() => {
    if (this.isCustomer()) {
      return [];
    }

    const hasPermission = this.authStore.hasPermission();
    const items: SidebarNavItem[] = [];

    if (hasPermission(PERMISSIONS.DASHBOARD_ACCESS)) {
      items.push({ label: 'แดชบอร์ด', icon: 'pi-chart-bar', route: '/dashboard' });
    }
    if (hasPermission(PERMISSIONS.ALL_TICKET_ACCESS)) {
      items.push({ label: 'จัดการ Tickets', icon: 'pi-list-check', route: '/ticket-management/list' });
    }
    if (hasPermission(PERMISSIONS.ALL_PROJECT_ACCESS)) {
      items.push({ label: 'จัดการโครงการ', icon: 'pi-folder-open', route: '/project-management/list' });
    }
    if (hasPermission(PERMISSIONS.MANAGE_USER_ACCESS)) {
      items.push({
        label: 'จัดการผู้ใช้',
        icon: 'pi-users',
        children: [
          { label: 'รายชื่อผู้ใช้ทั้งหมด', icon: '', route: '/user-management/list' },
          { label: 'ประเภทผู้ใช้', icon: '', route: '/user-type-management/list' },
        ],
      });
    }
    if (hasPermission(PERMISSIONS.MANAGE_COMPANY_ACCESS)) {
      items.push({ label: 'จัดการบริษัท', icon: 'pi-building', route: '/company-management/list' });
    }
    if (hasPermission(PERMISSIONS.MANAGE_DATA_ACCESS)) {
      items.push({
        label: 'จัดการข้อมูล',
        icon: 'pi-database',
        children: [
          { label: 'สถานะ', icon: '', route: '/status-management/list' },
          { label: 'ประเภท Ticket', icon: '', route: '/ticket-type-management/list' },
          { label: 'ระดับความสำคัญ', icon: '', route: '/ticket-priority-management/list' },
          { label: 'คลังความรู้ (FAQ)', icon: '', route: '/faq-management/list' },
        ],
      });
    }
    if (hasPermission(PERMISSIONS.SYSTEM_LOG_ACCESS)) {
      items.push({ label: 'Audit Log', icon: 'pi-history', route: '/audit-log/list' });
    }

    return items;
  });
}
