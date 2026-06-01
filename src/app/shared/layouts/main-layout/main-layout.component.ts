import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, SidebarNavItem, SidebarUser } from '../../components/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  protected readonly sidebarCollapsed = signal(false);

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
        { label: 'ประเภทผู้ใช้', icon: '', route: '/user-management/types' },
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
