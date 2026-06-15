import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatusChipComponent } from '../status-chip';

export interface Project {
  name: string;
  status: 'Open' | 'Closed';
  date: string;
  owner: string;
  totalTickets: number;
  completedTickets: number;
  members: { initials: string; color: string; avatarUrl?: string }[];
  highCount: number;
  normalCount: number;
  accentColor?: string;
  attachmentCount?: number;
}

@Component({
  selector: 'app-project-card',
  imports: [StatusChipComponent],
  templateUrl: './project-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
}
