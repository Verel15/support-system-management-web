import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { StatusChipComponent } from '../../../../shared/components/status-chip';
import { ProjectInfoComponent } from './project-info/project-info.component';
import { ProjectMembersComponent } from './project-members/project-members.component';
import { ProjectTicketsComponent } from './project-tickets/project-tickets.component';
import { ProjectDetail } from './project-detail.types';
import { ProjectService } from '../../services/project.service';
import { ProjectResponse } from '../../interfaces/project.interface';

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
export class ProjectDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);

  protected readonly headerMenu = viewChild.required<Menu>('headerMenu');
  protected readonly loading = signal(true);

  private readonly projectId = signal('');

  protected readonly project = signal<ProjectDetail>({
    id: '',
    name: '',
    color: '#3b82f6',
    status: 'Open',
    company: '',
    adminCount: 0,
    customerCount: 0,
    lastUpdated: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    totalUsers: 0,
    tickets: { open: 0, inProcess: 0, done: 0, close: 0, return: 0, reject: 0 },
  });

  protected readonly headerMenuItems: MenuItem[] = [
    { label: 'แก้ไขโครงการ', command: () => this.onEditProject() },
    { separator: true },
    { label: 'ปิดโครงการ', command: () => {} },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id') ?? '';
    this.projectId.set(id);
    if (id) {
      this.loadProject(id);
    } else {
      this.loading.set(false);
    }
  }

  private loadProject(id: string): void {
    this.projectService.getById(id).subscribe({
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
    const now = new Date();
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    const status: 'Open' | 'Closed' = now > end ? 'Closed' : 'Open';
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);

    return {
      id: r.id,
      name: r.name,
      color: r.color ?? '#3b82f6',
      status,
      company: r.companyName ?? '',
      adminCount: r.assigneeCount ?? 0,
      customerCount: r.customerCount ?? 0,
      lastUpdated: this.formatDate(r.updatedAt),
      startDate: this.formatDate(r.startDate),
      endDate: this.formatDate(r.endDate),
      totalDays,
      totalUsers: r.totalMembers ?? 0,
      tickets: { open: 0, inProcess: 0, done: 0, close: 0, return: 0, reject: 0 },
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
    this.router.navigate(['/project-management/list']);
  }

  protected onEditProject(): void {
    this.router.navigate(['/project-management/edit'], {
      queryParams: { id: this.project().id },
    });
  }

  protected onHeaderMore(event: MouseEvent): void {
    this.headerMenu().toggle(event);
  }
}
