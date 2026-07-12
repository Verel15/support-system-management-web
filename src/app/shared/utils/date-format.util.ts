import { format } from 'date-fns';

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const THAI_MONTHS_LONG = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_WEEKDAYS_LONG = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์',
];

const BUDDHIST_YEAR_OFFSET = 543;

function toBuddhistYear(date: Date): number {
  return date.getFullYear() + BUDDHIST_YEAR_OFFSET;
}

/** e.g. "12 มิ.ย. 69" */
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  const day = format(d, 'd');
  const yearShort = toBuddhistYear(d) % 100;
  return `${day} ${THAI_MONTHS_SHORT[d.getMonth()]} ${yearShort}`;
}

/** e.g. "12 มิ.ย. 69 12:30" */
export function formatDateTimeShort(date: Date | string): string {
  const d = new Date(date);
  return `${formatDateShort(d)} ${format(d, 'HH:mm')}`;
}

/** e.g. "12 มิถุนายน 2569" */
export function formatDateLong(date: Date | string): string {
  const d = new Date(date);
  const day = format(d, 'd');
  return `${day} ${THAI_MONTHS_LONG[d.getMonth()]} ${toBuddhistYear(d)}`;
}

/** e.g. "วันอาทิตย์ที่ 28 มิถุนายน 2569" */
export function formatDateFull(date: Date | string): string {
  const d = new Date(date);
  const day = format(d, 'd');
  return `${THAI_WEEKDAYS_LONG[d.getDay()]}ที่ ${day} ${THAI_MONTHS_LONG[d.getMonth()]} ${toBuddhistYear(d)}`;
}
