import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { ProjectInfoComponent } from './project-info/project-info.component';
import { ProjectMembersComponent } from './project-members/project-members.component';
import { ProjectTicketsComponent } from './project-tickets/project-tickets.component';
import { ProjectDetail } from './project-detail.types';

@Component({
  selector: 'app-project-detail',
  imports: [
    Menu,
    StatusChipComponent,
    ProjectInfoComponent,
    ProjectMembersComponent,
    ProjectTicketsComponent,
  ],
  templateUrl: './project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  private readonly router = inject(Router);

  protected readonly headerMenu = viewChild.required<Menu>('headerMenu');

  protected readonly project = signal<ProjectDetail>({
    name: 'Manage Pharmacy System',
    color: '#3b82f6',
    status: 'Open',
    company: 'Techpluz Solution Co., Ltd.',
    adminCount: 15,
    customerCount: 10,
    lastUpdated: '03/08/2566',
    startDate: '03/07/2566',
    endDate: '03/07/2567',
    totalDays: 365,
    totalUsers: 38,
    tickets: { open: 9, inProcess: 5, done: 1, close: 17, return: 1, reject: 5 },
  });

  protected readonly headerMenuItems: MenuItem[] = [
    { label: 'แก้ไขโครงการ', command: () => this.onEditProject() },
    { separator: true },
    { label: 'ปิดโครงการ', command: () => {} },
  ];

  protected onBack(): void {
    this.router.navigate(['/project-management/list']);
  }

  protected onEditProject(): void {
    this.router.navigate(['/project-management/edit']);
  }

  protected onHeaderMore(event: MouseEvent): void {
    this.headerMenu().toggle(event);
  }
}
