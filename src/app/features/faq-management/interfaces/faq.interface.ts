export type FaqDateRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

export interface FaqArticleRequest {
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
}

export interface FaqArticleResponse {
  id: string;
  question: string;
  answer: string;
  category: string;
  viewCount: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqArticlePageResponse {
  content: FaqArticleResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export const FAQ_DATE_OPTIONS: { label: string; value: FaqDateRange | null }[] = [
  { label: 'วันที่สร้าง', value: null },
  { label: 'วันนี้', value: 'TODAY' },
  { label: 'สัปดาห์นี้', value: 'THIS_WEEK' },
  { label: 'เดือนนี้', value: 'THIS_MONTH' },
];

export const FAQ_PUBLISH_STATUS_OPTIONS: { label: string; value: boolean | null }[] = [
  { label: 'ทั้งหมด', value: null },
  { label: 'เผยแพร่แล้ว', value: true },
  { label: 'แบบร่าง', value: false },
];
