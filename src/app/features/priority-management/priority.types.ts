export type PriorityIconKey =
  | 'circle'
  | 'tri-up'
  | 'tri-down'
  | 'arrow-up'
  | 'arrow-down'
  | 'chevron-up'
  | 'chevron-down';

export type PriorityColorKey =
  | 'blue'
  | 'orange'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'red'
  | 'pink';

export const ICON_CLASSES: Record<PriorityIconKey, string> = {
  'circle': 'pi pi-circle-fill',
  'tri-up': 'pi pi-caret-up',
  'tri-down': 'pi pi-caret-down',
  'arrow-up': 'pi pi-arrow-up',
  'arrow-down': 'pi pi-arrow-down',
  'chevron-up': 'pi pi-chevron-up',
  'chevron-down': 'pi pi-chevron-down',
};

export const ICON_KEYS: PriorityIconKey[] = [
  'circle', 'tri-up', 'tri-down', 'arrow-up', 'arrow-down', 'chevron-up', 'chevron-down',
];

export const COLOR_HEX: Record<PriorityColorKey, string> = {
  'blue': '#3b82f6',
  'orange': '#f97316',
  'yellow': '#eab308',
  'lime': '#4ade80',
  'green': '#22c55e',
  'red': '#ef4444',
  'pink': '#ec4899',
};

export const COLOR_KEYS: PriorityColorKey[] = [
  'blue', 'orange', 'yellow', 'lime', 'green', 'red', 'pink',
];
