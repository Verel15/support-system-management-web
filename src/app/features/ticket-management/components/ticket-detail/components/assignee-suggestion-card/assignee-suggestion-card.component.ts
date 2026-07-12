import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ESuggestedAssigneeReason,
  SuggestedAssigneeUser,
} from '../../../../interfaces/assignee-suggestion.interface';

function avatarInitial(name: string): string {
  return name?.trim().charAt(0).toUpperCase() ?? '?';
}

@Component({
  selector: 'app-assignee-suggestion-card',
  imports: [],
  templateUrl: './assignee-suggestion-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssigneeSuggestionCardComponent {
  readonly loading = input(false);
  readonly suggested = input<SuggestedAssigneeUser | null>(null);
  readonly reason = input<ESuggestedAssigneeReason | null>(null);
  readonly assigning = input(false);

  readonly assignSuggested = output<string>();
  readonly pickManually = output<void>();

  protected readonly initial = computed(() => avatarInitial(this.suggested()?.fullName ?? ''));

  protected readonly fallbackMessage = computed(() => {
    switch (this.reason()) {
      case 'NO_PROJECT_MEMBERS':
        return 'โปรเจกต์นี้ยังไม่มีสมาชิกที่รับมอบหมายงานได้';
      case 'NO_POSITION_MATCH':
      default:
        return 'ไม่มีพนักงานตำแหน่งที่ตรงกับ Ticket นี้ในโปรเจกต์';
    }
  });

  protected onAssign(): void {
    const candidate = this.suggested();
    if (candidate) this.assignSuggested.emit(candidate.userId);
  }
}
