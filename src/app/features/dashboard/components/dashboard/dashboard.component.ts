import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TicketsSummaryCardComponent } from '../tickets-summary-card/tickets-summary-card.component';
import { ProjectsOverviewCardComponent } from '../projects-overview-card/projects-overview-card.component';
import { TicketsOverviewCardComponent } from '../tickets-overview-card/tickets-overview-card.component';
import { TopProjectsCardComponent } from '../top-projects-card/top-projects-card.component';
import { TicketOpenChartCardComponent } from '../ticket-open-chart-card/ticket-open-chart-card.component';
import { UsersInSystemCardComponent } from '../users-in-system-card/users-in-system-card.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    TicketsSummaryCardComponent,
    ProjectsOverviewCardComponent,
    TicketsOverviewCardComponent,
    TopProjectsCardComponent,
    TicketOpenChartCardComponent,
    UsersInSystemCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
