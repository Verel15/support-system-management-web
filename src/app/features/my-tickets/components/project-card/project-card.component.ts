import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Tag } from 'primeng/tag';

export interface Project {
  name: string;
  status: 'Open' | 'Closed';
  date: string;
  owner: string;
  totalTickets: number;
  completedTickets: number;
  members: { initials: string; color: string }[];
  highCount: number;
  normalCount: number;
}

@Component({
  selector: 'app-project-card',
  imports: [Tag],
  templateUrl: './project-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProjectCardComponent {
  readonly project = input.required<Project>();
}
