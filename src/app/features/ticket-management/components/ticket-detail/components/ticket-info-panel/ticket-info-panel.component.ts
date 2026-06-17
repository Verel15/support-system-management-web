import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { Avatar } from 'primeng/avatar';
import { AvatarGroup } from 'primeng/avatargroup';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AssigneeUser, FeedUser, PriorityOption, SelectOption } from '../../ticket-detail.types';
import {
  TicketTypeDialogComponent,
  SelectedTicketType,
} from '../../../ticket-type-dialog/ticket-type-dialog.component';

@Component({
  selector: 'app-ticket-info-panel',
  imports: [FormsModule, Select, Avatar, AvatarGroup, Menu, TicketTypeDialogComponent],
  host: { class: 'flex flex-col bg-white border-t border-slate-200 lg:border-t-0 lg:border-l lg:overflow-y-auto lg:col-span-4' },
  templateUrl: './ticket-info-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TicketInfoPanelComponent {
  private readonly statusMenu = viewChild.required<Menu>('statusMenu');
  private readonly moreMenu = viewChild.required<Menu>('moreMenu');

  readonly assigneeList = input.required<AssigneeUser[]>();
  readonly requester = input.required<FeedUser>();
  readonly assigneeToggle = output<string>();
  readonly deleteTicket = output<void>();

  protected readonly showAssigneeDropdown = signal(false);
  protected readonly showTicketTypeDialog = signal(false);
  protected readonly selectedStatus = signal('pending');

  protected readonly selectedProject = signal<string | null>('book-bank');
  protected readonly selectedTicketTypeLabel = signal<string | null>('Security Identification');
  protected readonly selectedTeam = signal<string | null>('EVT-TEAM');
  protected readonly selectedPriority = signal<string | null>('medium');
  protected readonly selectedResolutionTime = signal<string | null>('2 ชั่วโมง');

  protected readonly projectOptions: SelectOption[] = [
    { label: 'Book Bank System', value: 'book-bank' },
    { label: 'Helpdesk', value: 'helpdesk' },
    { label: 'Internal Tools', value: 'internal-tools' },
  ];

  protected readonly teamOptions = [
    { label: 'EVT-TEAM', value: 'EVT-TEAM' },
    { label: 'DEV-TEAM', value: 'DEV-TEAM' },
    { label: 'OPS-TEAM', value: 'OPS-TEAM' },
  ];

  protected readonly priorityOptions: PriorityOption[] = [
    { label: 'สำคัญมาก', value: 'high', color: '#ef4444' },
    { label: 'สำคัญปานกลาง', value: 'medium', color: '#f59e0b' },
    { label: 'สำคัญน้อย', value: 'low', color: '#22c55e' },
  ];

  protected readonly resolutionTimeOptions: SelectOption[] = [
    { label: '1 ชั่วโมง', value: '1 ชั่วโมง' },
    { label: '2 ชั่วโมง', value: '2 ชั่วโมง' },
    { label: '4 ชั่วโมง', value: '4 ชั่วโมง' },
    { label: '8 ชั่วโมง', value: '8 ชั่วโมง' },
    { label: '1 วัน', value: '1 วัน' },
    { label: '2 วัน', value: '2 วัน' },
    { label: '3 วัน', value: '3 วัน' },
  ];

  protected readonly statusOptions: SelectOption[] = [
    { label: 'Open', value: 'open' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'In Review', value: 'in-review' },
    { label: 'Done', value: 'done' },
    { label: 'Close', value: 'close' },
    { label: 'Return', value: 'return' },
  ];

  protected readonly statusMenuItems: MenuItem[] = [
    { label: 'Open', command: () => this.selectedStatus.set('open') },
    { label: 'Pending', command: () => this.selectedStatus.set('pending') },
    { label: 'In Progress', command: () => this.selectedStatus.set('in-progress') },
    { label: 'In Review', command: () => this.selectedStatus.set('in-review') },
    { label: 'Done', command: () => this.selectedStatus.set('done') },
    { label: 'Close', command: () => this.selectedStatus.set('close') },
    { label: 'Return', command: () => this.selectedStatus.set('return') },
  ];

  protected readonly moreMenuItems: MenuItem[] = [
    { label: 'ลบ Ticket', command: () => this.deleteTicket.emit() },
  ];

  protected readonly selectedStatusLabel = computed(
    () => this.statusOptions.find((s) => s.value === this.selectedStatus())?.label ?? 'Open',
  );

  protected readonly selectedAssignees = computed(() =>
    this.assigneeList().filter((a) => a.selected),
  );

  protected onStatusMenuOpen(event: MouseEvent): void {
    this.statusMenu().toggle(event);
  }

  protected onMoreMenuOpen(event: MouseEvent): void {
    this.moreMenu().toggle(event);
  }

  protected toggleAssigneeDropdown(): void {
    this.showAssigneeDropdown.update((v) => !v);
  }

  protected onAssigneeToggle(id: string): void {
    this.assigneeToggle.emit(id);
  }

  protected openTicketTypeDialog(): void {
    this.showTicketTypeDialog.set(true);
  }

  protected onTicketTypeConfirmed(data: SelectedTicketType): void {
    this.selectedTicketTypeLabel.set(data.subCategory);
    this.selectedTeam.set(data.team);
    this.selectedResolutionTime.set(data.resolutionTime);
  }
}
