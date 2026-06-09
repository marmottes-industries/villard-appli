import type { IconName } from '@/src/components/icons/Icon';
import type { WorkPriority, WorkStatus, WorkType } from '@/src/api/work';

export type StatusTone = 'idea' | 'planned' | 'progress' | 'done' | 'cancelled';
export type PriorityTone = 'low' | 'medium' | 'high';

export const STATUS_META: Record<WorkStatus, { label: string; tone: StatusTone; fg: string; bg: string; border: string }> = {
  suggested:   { label: 'Idée',     tone: 'idea',      fg: '#7a766e', bg: '#efece6', border: '#C7BEA4' },
  planned:     { label: 'Planifié', tone: 'planned',   fg: '#3d6184', bg: '#e3edf5', border: '#6a8aa8' },
  in_progress: { label: 'En cours', tone: 'progress',  fg: '#4a8c5a', bg: '#e4f0e6', border: '#4a8c5a' },
  done:        { label: 'Terminé',  tone: 'done',      fg: '#5b7a58', bg: '#e7ede4', border: '#8aab87' },
  cancelled:   { label: 'Annulé',   tone: 'cancelled', fg: '#8a847d', bg: '#ede9e3', border: '#b5b1aa' },
};

export const TYPE_META: Record<WorkType, { label: string; icon: IconName }> = {
  diy: { label: 'Bricolage',  icon: 'gear' },
  pro: { label: 'Prestation', icon: 'users' },
};

export const PRIORITY_META: Record<WorkPriority, { label: string; tone: PriorityTone; fg: string; bg: string }> = {
  low:    { label: 'Faible',  tone: 'low',    fg: '#5b7a58', bg: '#e7ede4' },
  medium: { label: 'Moyenne', tone: 'medium', fg: '#876a2f', bg: '#f3ead7' },
  high:   { label: 'Haute',   tone: 'high',   fg: '#8c3a2e', bg: '#f5dfd9' },
};

export const STATUS_ORDER: WorkStatus[] = [
  'in_progress',
  'planned',
  'suggested',
  'done',
  'cancelled',
];

export const PRIORITY_ORDER: Record<WorkPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const STATUS_OPTIONS: WorkStatus[] = [
  'suggested',
  'planned',
  'in_progress',
  'done',
  'cancelled',
];

export const TYPE_OPTIONS: WorkType[] = ['diy', 'pro'];
export const PRIORITY_OPTIONS: WorkPriority[] = ['low', 'medium', 'high'];
