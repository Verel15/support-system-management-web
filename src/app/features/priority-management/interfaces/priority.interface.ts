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
  circle: 'pi pi-circle-fill',
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
  blue: '#3b82f6',
  orange: '#f97316',
  yellow: '#eab308',
  lime: '#4ade80',
  green: '#22c55e',
  red: '#ef4444',
  pink: '#ec4899',
};

export const COLOR_KEYS: PriorityColorKey[] = [
  'blue', 'orange', 'yellow', 'lime', 'green', 'red', 'pink',
];

// ── API enums ──────────────────────────────────────────────────────────────────

export type PriorityIconShape =
  | 'CIRCLE' | 'TRIUP' | 'TRIDOWN' | 'ARROWUP' | 'ARROWDOWN' | 'CHEVRONUP' | 'CHEVRONDOWN';

export type PriorityIconColor =
  | 'BLUE' | 'ORANGE' | 'YELLOW' | 'LIME' | 'GREEN' | 'RED' | 'PINK';

export type PriorityIntervalUnit =
  | 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

// ── API interfaces ─────────────────────────────────────────────────────────────

export interface PriorityRequest {
  name: string;
  description?: string;
  iconShape: PriorityIconShape;
  iconColor: PriorityIconColor;
  intervalValue: number;
  intervalUnit: PriorityIntervalUnit;
}

export interface PriorityResponse {
  id: string;
  name: string;
  description?: string;
  iconShape: PriorityIconShape;
  iconColor: PriorityIconColor;
  intervalValue: number;
  intervalUnit: PriorityIntervalUnit;
  createdAt: string;
  updatedAt: string;
}

export interface PriorityPageResponse {
  content: PriorityResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ── UI ↔ API key mappings ──────────────────────────────────────────────────────

export const ICON_SHAPE_MAP: Record<PriorityIconKey, PriorityIconShape> = {
  circle: 'CIRCLE',
  'tri-up': 'TRIUP',
  'tri-down': 'TRIDOWN',
  'arrow-up': 'ARROWUP',
  'arrow-down': 'ARROWDOWN',
  'chevron-up': 'CHEVRONUP',
  'chevron-down': 'CHEVRONDOWN',
};

export const SHAPE_TO_ICON_KEY: Record<PriorityIconShape, PriorityIconKey> = {
  CIRCLE: 'circle',
  TRIUP: 'tri-up',
  TRIDOWN: 'tri-down',
  ARROWUP: 'arrow-up',
  ARROWDOWN: 'arrow-down',
  CHEVRONUP: 'chevron-up',
  CHEVRONDOWN: 'chevron-down',
};

export const ICON_COLOR_MAP: Record<PriorityColorKey, PriorityIconColor> = {
  blue: 'BLUE',
  orange: 'ORANGE',
  yellow: 'YELLOW',
  lime: 'LIME',
  green: 'GREEN',
  red: 'RED',
  pink: 'PINK',
};

export const COLOR_TO_COLOR_KEY: Record<PriorityIconColor, PriorityColorKey> = {
  BLUE: 'blue',
  ORANGE: 'orange',
  YELLOW: 'yellow',
  LIME: 'lime',
  GREEN: 'green',
  RED: 'red',
  PINK: 'pink',
};

// ── Duration options ───────────────────────────────────────────────────────────

export interface DurationOption {
  label: string;
  value: string;
  intervalValue: number;
  intervalUnit: PriorityIntervalUnit;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { label: '30 นาที',   value: '30m', intervalValue: 30, intervalUnit: 'MINUTE' },
  { label: '1 ชั่วโมง', value: '1h',  intervalValue: 1,  intervalUnit: 'HOUR' },
  { label: '2 ชั่วโมง', value: '2h',  intervalValue: 2,  intervalUnit: 'HOUR' },
  { label: '4 ชั่วโมง', value: '4h',  intervalValue: 4,  intervalUnit: 'HOUR' },
  { label: '8 ชั่วโมง', value: '8h',  intervalValue: 8,  intervalUnit: 'HOUR' },
  { label: '1 วัน',     value: '1d',  intervalValue: 1,  intervalUnit: 'DAY' },
  { label: '2 วัน',     value: '2d',  intervalValue: 2,  intervalUnit: 'DAY' },
  { label: '3 วัน',     value: '3d',  intervalValue: 3,  intervalUnit: 'DAY' },
  { label: '5 วัน',     value: '5d',  intervalValue: 5,  intervalUnit: 'DAY' },
  { label: '7 วัน',     value: '7d',  intervalValue: 7,  intervalUnit: 'DAY' },
];

export function getDurationInterval(
  durationValue: string,
): { intervalValue: number; intervalUnit: PriorityIntervalUnit } | null {
  const opt = DURATION_OPTIONS.find((d) => d.value === durationValue);
  return opt ? { intervalValue: opt.intervalValue, intervalUnit: opt.intervalUnit } : null;
}

export function findDurationValue(
  intervalValue: number,
  intervalUnit: PriorityIntervalUnit,
): string | null {
  return (
    DURATION_OPTIONS.find(
      (d) => d.intervalValue === intervalValue && d.intervalUnit === intervalUnit,
    )?.value ?? null
  );
}
