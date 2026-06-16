import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { SelectItemsDialogComponent } from '../../../../../../shared/components/dialogs';
import { AddProjectStore } from '../../../../store/add-project.store';

@Component({
  selector: 'app-step2-add-users',
  imports: [Button, SelectItemsDialogComponent],
  templateUrl: './step2-add-users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step2AddUsersComponent {
  protected readonly store = inject(AddProjectStore);

  protected readonly showCustomerDialog = signal(false);
  protected readonly showManagerDialog = signal(false);

  readonly prev = output<void>();
  readonly next = output<void>();
}
