import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { Button } from 'primeng/button';
import { AddProjectStore } from '../../../../store/add-project.store';

@Component({
  selector: 'app-step3-review',
  imports: [Button],
  templateUrl: './step3-review.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Step3ReviewComponent {
  protected readonly store = inject(AddProjectStore);

  readonly prev = output<void>();
  readonly save = output<void>();
}
