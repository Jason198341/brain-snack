export interface Quiz {
  slug: string;
  title: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  category: Category;
  difficulty: 1 | 2 | 3;
  publishedAt: string;
  metadata?: QuizMetadata;
}

export interface QuizMetadata {
  concept?: string;
  hook?: string;
  oneLiner?: string;
  plusOne?: string;
  viralScore?: number;
  shareHook?: string;
}

export type Category =
  | '경제/경영'
  | '한국사'
  | '과학/기술'
  | '법/사회'
  | '심리/교육'
  | 'IT/디지털'
  | '지리/환경'
  | '건강/의학'
  | '문학/예술'
  | '스페셜';

export type QuizState = 'UNSOLVED' | 'SOLVING' | 'CORRECT' | 'WRONG';

export interface QuizResult {
  choice: number;
  result: 'CORRECT' | 'WRONG';
  timestamp: number;
}

export interface QuizStats {
  total: number;
  distribution: number[];
}

export interface Subscriber {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'paused' | 'unsubscribed';
  categories?: Category[];
  subscribedAt?: string;
}

export const CATEGORIES: Category[] = [
  '경제/경영',
  '한국사',
  '과학/기술',
  '법/사회',
  '심리/교육',
  'IT/디지털',
  '지리/환경',
  '건강/의학',
  '문학/예술',
  '스페셜',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  '경제/경영': '#6C5CE7',
  '한국사': '#E17055',
  '과학/기술': '#00B894',
  '법/사회': '#0984E3',
  '심리/교육': '#E84393',
  'IT/디지털': '#00D2D3',
  '지리/환경': '#55A3A4',
  '건강/의학': '#FF6B6B',
  '문학/예술': '#FECA57',
  '스페셜': '#A29BFE',
};

export const DIFFICULTY_LABELS = ['', '쉬움', '보통', '어려움'] as const;
