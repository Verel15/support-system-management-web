import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';

export interface SelectItemOption {
  value: string;
  label: string;
  avatar?: string;
  sublabel?: string;
}

@Component({
  selector: 'app-select-items-dialog',
  imports: [FormsModule, Avatar, Button, Checkbox, Dialog, IconField, InputIcon, InputText],
  templateUrl: './select-items-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectItemsDialogComponent {
  readonly visible = model(false);
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly countLabel = input('จำนวน');
  readonly items = input.required<SelectItemOption[]>();
  readonly selected = input<string[]>([]);

  readonly confirmed = output<string[]>();
  readonly cancelled = output<void>();

  protected readonly searchQuery = signal('');
  protected readonly localSelected = signal<string[]>([]);

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.localSelected.set([...this.selected()]);
        this.searchQuery.set('');
      }
    });
  }

  protected readonly countText = computed(
    () => `${this.countLabel()}(${this.localSelected().length})`,
  );

  protected readonly filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return !query
      ? this.items()
      : this.items().filter((item) => item.label.toLowerCase().includes(query));
  });

  protected isSelected(value: string): boolean {
    return this.localSelected().includes(value);
  }

  protected toggleItem(value: string): void {
    this.localSelected.update((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    );
  }

  protected clearAll(): void {
    this.localSelected.set([]);
    this.searchQuery.set('');
  }

  protected onConfirm(): void {
    this.confirmed.emit(this.localSelected());
    this.visible.set(false);
  }

  protected onCancel(): void {
    this.cancelled.emit();
    this.visible.set(false);
  }
}
