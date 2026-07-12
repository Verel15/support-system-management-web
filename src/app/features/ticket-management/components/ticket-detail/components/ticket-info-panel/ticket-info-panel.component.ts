import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar } from 'primeng/avatar';
import { AvatarGroup } from 'primeng/avatargroup';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AssigneeUser, FeedUser } from '../../interfaces/ticket-detail.types';
import {
  TicketDetailResponse,
  StatusItemResponse,
  TicketStatusGroup,
} from '../../../../interfaces/ticket.interface';
import { AssigneeSuggestionCardComponent } from '../assignee-suggestion-card/assignee-suggestion-card.component';
import {
  TicketTypeDialogComponent,
  SelectedTicketType,
} from '../../../ticket-type-dialog/ticket-type-dialog.component';
import { TicketService } from '../../../../services/ticket.service';
import {
  ESuggestedAssigneeReason,
  SuggestedAssigneeUser,
} from '../../../../interfaces/assignee-suggestion.interface';

@Component({
  selector: 'app-ticket-info-panel',
  imports: [
    DatePipe,
    FormsModule,
    Avatar,
    AvatarGroup,
    Menu,
    AssigneeSuggestionCardComponent,
    TicketTypeDialogComponent,
  ],
  host: {
    class: 'flex flex-col bg-white lg:overflow-y-auto lg:col-span-4',
  },
  templateUrl: './ticket-info-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketInfoPanelComponent {
  private readonly statusMenu = viewChild.required<Menu>('statusMenu');
  private readonly moreMenu = viewChild.required<Menu>('moreMenu');
  private readonly ticketService = inject(TicketService);

  readonly ticket = input.required<TicketDetailResponse>();
  readonly assigneeList = input.required<AssigneeUser[]>();
  readonly requester = input.required<FeedUser>();
  readonly statusItems = input<StatusItemResponse[]>([]);

  readonly assigneeAdd = output<string>();
  readonly assigneeRemove = output<string>();
  readonly statusChange = output<string>();
  readonly deleteTicket = output<void>();
  readonly ticketTypeChange = output<SelectedTicketType>();

  protected readonly showAssigneeDropdown = signal(false);
  protected readonly showTicketTypeDialog = signal(false);

  protected readonly suggestionLoading = signal(false);
  protected readonly suggestedCandidate = signal<SuggestedAssigneeUser | null>(null);
  protected readonly suggestionReason = signal<ESuggestedAssigneeReason | null>(null);
  private lastSuggestionTicketId = '';

  constructor() {
    effect(() => {
      const ticket = this.ticket();
      const hasAssignees = this.assigneeList().length > 0;
      if (!ticket || hasAssignees || this.lastSuggestionTicketId === ticket.id) return;

      this.lastSuggestionTicketId = ticket.id;
      this.suggestionLoading.set(true);
      this.ticketService.getSuggestedAssignee(ticket.id).subscribe({
        next: (res) => {
          this.suggestedCandidate.set(res.suggested);
          this.suggestionReason.set(res.reason);
          this.suggestionLoading.set(false);
        },
        error: () => {
          this.suggestedCandidate.set(null);
          this.suggestionReason.set(null);
          this.suggestionLoading.set(false);
        },
      });
    });
  }

  protected readonly showSuggestionCard = computed(() => this.assigneeList().length === 0);

  protected readonly statusMenuItems = computed<MenuItem[]>(() =>
    this.statusItems().map((s) => ({
      label: s.name,
      command: () => this.statusChange.emit(s.id),
    })),
  );

  protected readonly moreMenuItems: MenuItem[] = [
    { label: 'ลบ Ticket', command: () => this.deleteTicket.emit() },
  ];

  protected readonly statusButtonClass = computed(() => {
    const group = this.ticket().currentStatusGroup;
    const base =
      'inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ';
    const map: Record<string, string> = {
      START: 'bg-blue-50 text-blue-800 hover:bg-[#dde3e6] focus-visible:ring-[#455A64]',
      PROCESS: 'bg-warning-50 text-warning-600 hover:bg-[#ffe0b2] focus-visible:ring-[#E65100]',
      SUCCESS: 'bg-green-50 text-green-800 hover:bg-[#c8e6c9] focus-visible:ring-[#2E7D32]',
      FAILED: 'bg-red-50 text-red-800 hover:bg-[#ffcdd2] focus-visible:ring-[#C62828]',
    };
    return base + (map[group] ?? map['START']);
  });

  protected readonly selectedAssignees = computed(() =>
    this.assigneeList().filter((a) => a.selected),
  );

  protected readonly createdAtDisplay = computed(() => {
    const t = this.ticket();
    if (!t?.createdAt) return '—';
    return this.formatThai(t.createdAt);
  });

  protected readonly updatedAtDisplay = computed(() => {
    const t = this.ticket();
    if (!t?.updatedAt) return '—';
    return this.formatThai(t.updatedAt);
  });

  protected readonly dueDateDisplay = computed(()=>{
   const t = this.ticket();
   if (!t?.dueDate) return '-';
   return this.formatThai(t.dueDate);
  });

  protected readonly isOverdue = computed(() => {
    const t = this.ticket();
    if (!t?.dueDate) return false;
    const closedGroups: TicketStatusGroup[] = ['SUCCESS', 'FAILED'];
    if (closedGroups.includes(t.currentStatusGroup)) return false;
    return new Date(t.dueDate).getTime() < Date.now();
  });
  protected readonly resolutionTimeDisplay = computed(() => {
    const t = this.ticket();
    if (!t?.priorityIntervalValue || !t?.priorityIntervalUnit) return '—';
    const unitMap: Record<string, string> = {
      MINUTE: 'นาที',
      HOUR: 'ชั่วโมง',
      DAY: 'วัน',
      WEEK: 'สัปดาห์',
      MONTH: 'เดือน',
      YEAR: 'ปี',
    };
    return `${t.priorityIntervalValue} ${unitMap[t.priorityIntervalUnit] ?? t.priorityIntervalUnit}`;
  });

  private formatThai(iso: string): string {
    return new Intl.DateTimeFormat('th-TH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok',
    }).format(new Date(iso));
  }

  protected onStatusMenuOpen(event: MouseEvent): void {
    this.statusMenu().toggle(event);
  }

  protected onMoreMenuOpen(event: MouseEvent): void {
    this.moreMenu().toggle(event);
  }

  protected toggleAssigneeDropdown(): void {
    this.showAssigneeDropdown.update((v) => !v);
  }

  protected onAssigneeToggle(userId: string, selected: boolean): void {
    if (selected) {
      this.assigneeRemove.emit(userId);
    } else {
      this.assigneeAdd.emit(userId);
    }
  }

  protected onAssignSuggested(userId: string): void {
    this.assigneeAdd.emit(userId);
  }

  protected onPickManually(): void {
    this.showAssigneeDropdown.set(true);
  }

  protected onOpenTicketTypeDialog(): void {
    this.showTicketTypeDialog.set(true);
  }

  protected onTicketTypeConfirmed(selected: SelectedTicketType): void {
    this.ticketTypeChange.emit(selected);
  }
}
