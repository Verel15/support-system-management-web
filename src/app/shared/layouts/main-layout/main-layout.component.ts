import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SidebarComponent, SidebarNavItem, SidebarUser } from '../../components/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, NgOptimizedImage],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  protected readonly sidebarCollapsed = signal(false);
  protected readonly mobileOpen = signal(false);

  private readonly router = inject(Router);

  // On lg+ the sidebar is a normal flex child; on mobile it's a fixed drawer
  protected readonly sidebarDrawerClass = computed(() =>
    this.mobileOpen()
      ? 'fixed inset-y-0 left-0 z-30 translate-x-0 transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:translate-x-0'
      : 'fixed inset-y-0 left-0 z-30 -translate-x-full transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:translate-x-0'
  );

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.mobileOpen.set(false));
  }

  protected readonly currentUser: SidebarUser = {
    name: 'ใจงาม สุดใจจริง',
    role: 'แอดมิน',
    avatarUrl: '/logo/logo-sms.png',
  };

  protected readonly personalNav: SidebarNavItem[] = [
    { label: 'Tickets ของฉัน', icon: 'pi-ticket', route: '/dashboard/my-tickets' },
    { label: 'โครงการของฉัน', icon: 'pi-folder', route: '/dashboard/my-projects' },
    { label: 'การแจ้งเตือน', icon: 'pi-bell', route: '/dashboard/notifications', badge: 5 },
  ];

  protected readonly mainNav: SidebarNavItem[] = [
    { label: 'แดชบอร์ด', icon: 'pi-chart-bar', route: '/dashboard/overview' },
    { label: 'จัดการ Tickets', icon: 'pi-list-check', route: '/dashboard/tickets' },
    { label: 'จัดการโครงการ', icon: 'pi-folder-open', route: '/dashboard/projects' },
    {
      label: 'จัดการผู้ใช้',
      icon: 'pi-users',
      children: [
        { label: 'รายชื่อผู้ใช้ทั้งหมด', icon: '', route: '/user-management/list' },
        { label: 'ประเภทผู้ใช้', icon: '', route: '/user-type-management/list' },
      ],
    },
    { label: 'จัดการบริษัท', icon: 'pi-building', route: '/dashboard/companies' },
    {
      label: 'จัดการข้อมูล',
      icon: 'pi-database',
      children: [
        { label: 'ข้อมูลทั่วไป', icon: '', route: '/dashboard/data/general' },
      ],
    },
  ];
}
