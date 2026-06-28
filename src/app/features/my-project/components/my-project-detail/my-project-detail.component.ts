import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { ProjectInfoComponent } from '../../../project-management/components/project-detail/project-info/project-info.component';
import { ProjectMembersComponent } from '../../../project-management/components/project-detail/project-members/project-members.component';
import { ProjectTicketsComponent } from '../../../project-management/components/project-detail/project-tickets/project-tickets.component';
import { ProjectDetail } from '../../../project-management/components/project-detail/project-detail.types';

@Component({
  selector: 'app-my-project-detail',
  imports: [
    StatusChipComponent,
    ProjectInfoComponent,
    ProjectMembersComponent,
    ProjectTicketsComponent,
  ],
  templateUrl: './my-project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProjectDetailComponent {
  private readonly router = inject(Router);

  protected readonly project = signal<ProjectDetail>({
    id: '',
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

  protected onBack(): void {
    this.router.navigate(['/my-project/list']);
  }
}
