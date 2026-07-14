import { PriorityIconColor } from '../interfaces/ticket.interface';

function priorityShapeIcon(shape: string): string {
  switch (shape) {
    case 'ARROWUP':
    case 'CHEVRONUP':
    case 'TRIUP':
      return 'pi pi-caret-up';
    case 'ARROWDOWN':
    case 'CHEVRONDOWN':
    case 'TRIDOWN':
      return 'pi pi-caret-down';
    case 'CIRCLE':
      return 'pi pi-circle-fill';
    default:
      return 'pi pi-minus';
  }
}

function priorityColorClass(color: PriorityIconColor): string {
  switch (color) {
    case 'RED':
      return 'text-error-600';
    case 'ORANGE':
      return 'text-orange-500';
    case 'YELLOW':
      return 'text-warning-500';
    case 'LIME':
    case 'GREEN':
      return 'text-primary-500';
    case 'BLUE':
      return 'text-blue-500';
    case 'PINK':
      return 'text-pink-500';
    default:
      return 'text-slate-400';
  }
}

export function getPriorityIconClass(row: Record<string, unknown>): string {
  const shape = row['priorityIconShape'] as string;
  const color = row['priorityIconColor'] as PriorityIconColor;
  if (!shape || !color) return '';
  return `${priorityShapeIcon(shape)} ${priorityColorClass(color)}`;
}
