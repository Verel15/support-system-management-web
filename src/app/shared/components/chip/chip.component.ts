import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ChipColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info';
export type ChipVariant = 'outlined' | 'filled';
export type ChipSize = 'sm' | 'md';

@Component({
  selector: 'app-chip',
  template: `<span [class]="classes()" [title]="label()">{{ label() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  readonly label = input.required<string>();
  readonly color = input<ChipColor>('secondary');
  readonly variant = input<ChipVariant>('outlined');
  readonly size = input<ChipSize>('md');

  protected readonly classes = computed(() => {
    const map: Record<ChipColor, Record<ChipVariant, string>> = {
      primary: {
        outlined: 'border border-primary-500 text-primary-700 font-bold',
        filled: 'bg-primary-50 text-primary-800 font-bold',
      },
      secondary: {
        outlined: 'border border-secondary-400 text-secondary-700 font-bold',
        filled: 'bg-secondary-100 text-secondary-800 font-bold',
      },
      error: {
        outlined: 'border border-error-500 text-error-700 font-bold',
        filled: 'bg-error-50 text-error-800 font-bold',
      },
      warning: {
        outlined: 'border border-warning-500 text-warning-700 font-bold',
        filled: 'bg-warning-50 text-warning-800 font-bold',
      },
      info: {
        outlined: 'border border-blue-500 text-blue-700 font-bold',
        filled: 'bg-blue-50 text-blue-800 font-bold',
      },
    };
    const sizeClasses = this.size() === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    return `inline-flex items-center max-w-full rounded-full font-medium whitespace-nowrap overflow-hidden text-ellipsis ${sizeClasses} ${map[this.color()][this.variant()]}`;
  });
}
