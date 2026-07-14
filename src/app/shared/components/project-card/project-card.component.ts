import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { StatusChipComponent } from '../status-chip';

export interface Project {
  id: string;
  name: string;
  status: 'OPEN' | 'CLOSED' | 'WAITING';
  date: string;
  owner: string;
  totalTickets: number;
  members: { initials: string; color: string; avatarUrl?: string; fullName?: string }[];
  highCount: number;
  normalCount: number;
  accentColor?: string;
  attachmentCount?: number;
  successTicketCount: number;
}

@Component({
  selector: 'app-project-card',
  imports: [StatusChipComponent, Tooltip],
  templateUrl: './project-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
  readonly clickable = input(false);
  readonly cardClick = output<Project>();

  onCardClick(): void {
    if (this.clickable()) {
      this.cardClick.emit(this.project());
    }
  }
}
