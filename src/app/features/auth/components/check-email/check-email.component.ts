import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-check-email',
  imports: [RouterLink],
  templateUrl: './check-email.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckEmailComponent {
  private route = inject(ActivatedRoute);

  email = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('email') ?? '')),
    { initialValue: '' },
  );
}
