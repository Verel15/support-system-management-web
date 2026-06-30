import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { AssigneeUser, FeedUser } from '../../ticket-detail.types';
import { TicketDetailResponse, StatusItemResponse } from '../../../../interfaces/ticket.interface';

@Component({
  selector: 'app-ticket-info-panel',
  imports: [DatePipe, FormsModule, Avatar, AvatarGroup, Menu],
  host: {
    class:
      'flex flex-col bg-white border-t border-slate-200 lg:border-t-0 lg:border-l lg:overflow-y-auto lg:col-span-4',
  },
  templateUrl: './ticket-info-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketInfoPanelComponent {
  private readonly statusMenu = viewChild.required<Menu>('statusMenu');
  private readonly moreMenu = viewChild.required<Menu>('moreMenu');

  readonly ticket = input.required<TicketDetailResponse>();
  readonly assigneeList = input.required<AssigneeUser[]>();
  readonly requester = input.required<FeedUser>();
  readonly statusItems = input<StatusItemResponse[]>([]);

  readonly assigneeAdd = output<string>();
  readonly assigneeRemove = output<string>();
  readonly statusChange = output<string>();
  readonly deleteTicket = output<void>();

  protected readonly showAssigneeDropdown = signal(false);

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
}
