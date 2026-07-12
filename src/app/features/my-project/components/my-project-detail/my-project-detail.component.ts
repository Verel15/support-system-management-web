import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { ProjectInfoComponent } from '../../../project-management/components/project-detail/project-info/project-info.component';
import { ProjectMembersComponent } from '../../../project-management/components/project-detail/project-members/project-members.component';
import { ProjectTicketsComponent } from '../../../project-management/components/project-detail/project-tickets/project-tickets.component';
import { ProjectDetail } from '../../../project-management/components/project-detail/project-detail.types';
import { ProjectService } from '../../../project-management/services/project.service';
import { ProjectResponse } from '../../../project-management/interfaces/project.interface';

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
export class MyProjectDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);

  protected readonly loading = signal(true);

  protected readonly project = signal<ProjectDetail>({
    id: '',
    name: '',
    color: '#3b82f6',
    status: 'OPEN',
    company: '',
    adminCount: 0,
    customerCount: 0,
    lastUpdated: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    totalUsers: 0,
  });

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id') ?? '';
    if (id) {
      this.loadProject(id);
    } else {
      this.loading.set(false);
    }
  }

  private loadProject(id: string): void {
    this.projectService.getMyById(id).subscribe({
      next: (res) => {
        this.project.set(this.mapToDetail(res));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private mapToDetail(r: ProjectResponse): ProjectDetail {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);

    return {
      id: r.id,
      name: r.name,
      color: r.color ?? '#3b82f6',
      status: r.status,
      company: r.companyName ?? '',
      adminCount: r.assigneeCount ?? 0,
      customerCount: r.customerCount ?? 0,
      lastUpdated: this.formatDate(r.updatedAt),
      startDate: this.formatDate(r.startDate),
      endDate: this.formatDate(r.endDate),
      totalDays,
      totalUsers: r.totalMembers ?? 0
    };
  }

  private formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
  }

  protected onBack(): void {
    this.router.navigate(['/my-project/list']);
  }
}
