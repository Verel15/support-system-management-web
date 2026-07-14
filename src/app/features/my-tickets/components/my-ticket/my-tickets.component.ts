import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Tabs, TabList, Tab } from 'primeng/tabs';
import { Project, ProjectCardComponent } from '../../../../shared/components/project-card';
import { ProjectService } from '../../../project-management/services/project.service';
import { ProjectResponse } from '../../../project-management/interfaces/project.interface';
import { WorkTicketsTabComponent } from './tabs/work-tickets-tab/work-tickets-tab.component';
import { MyTicketsTabComponent } from './tabs/my-tickets-tab/my-tickets-tab.component';
import { FeedbackTabComponent } from './tabs/feedback-tab/feedback-tab.component';

@Component({
  selector: 'app-my-tickets',
  imports: [
    RouterLink,
    Button,
    Tabs,
    TabList,
    Tab,
    ProjectCardComponent,
    WorkTicketsTabComponent,
    MyTicketsTabComponent,
    FeedbackTabComponent,
  ],
  templateUrl: './my-tickets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyTicketsComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);

  protected readonly activeTab = signal(0);
  protected readonly recentProjects = signal<Project[]>([]);

  private readonly memberColors = [
    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6',
    '#ef4444', '#ec4899', '#f97316', '#06b6d4',
  ];

  ngOnInit(): void {
    this.loadRecentProjects();
  }

  private loadRecentProjects(): void {
    this.projectService.getMy(0, 4).subscribe({
      next: (res) => this.recentProjects.set(res.content.map((r) => this.mapToProject(r))),
      error: () => this.recentProjects.set([]),
    });
  }

  private mapToProject(r: ProjectResponse): Project {
    return {
      id: r.id,
      name: r.name,
      status: r.status,
      date: this.formatDate(r.endDate),
      owner: r.companyName ?? '',
      totalTickets: r.totalTickets,
      successTicketCount: r.successTicketCount,
      members: (r.members ?? []).map((m, i) => ({
        initials: m.fullName.charAt(0),
        color: this.memberColors[i % this.memberColors.length],
        avatarUrl: m.profileImageUrl || undefined,
        fullName: m.fullName,
      })),
      highCount: 0,
      normalCount: 0,
      accentColor: r.color ?? '#3b82f6',
      attachmentCount: r.documentCount ?? 0,
    };
  }

  private formatDate(isoDate: string): string {
    const d = new Date(isoDate);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = ((d.getFullYear() + 543) % 100).toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  protected onTabChange(tab: number): void {
    this.activeTab.set(tab);
  }

  protected onProjectClick(project: Project): void {
    this.router.navigate(['/my-project/detail'], { queryParams: { id: project.id } });
  }
}
