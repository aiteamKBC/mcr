import type { McrReview } from '../types/mcr';
import { meetingListDateTimeLabels } from './meetingDisplay';

function csvEscape(cell: string): string {
  const s = String(cell ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function entityName(value: string | { name?: string } | unknown): string {
  if (value && typeof value === 'object' && 'name' in (value as object)) {
    return String((value as { name: string }).name ?? '');
  }
  return String(value ?? '');
}

/**
 * Build a CSV matching the Reviews list columns and trigger a browser download.
 */
export function exportReviewsListToCsv(reviews: McrReview[], filenameBase = 'mcr-reviews-export'): void {
  const headers = [
    'Review ID',
    'Date',
    'Time',
    'Learner',
    'Coach',
    'Programme',
    'Group',
    'Duration (min)',
    'RAG',
    'Rating',
    'Safeguarding flagged',
    'Satisfaction',
    'Communicated Employer',
    'Communicated Learner',
    'Communicated QA',
  ];

  const rows = reviews.map((r) => {
    const { date: dateStr, time: timeStr } = meetingListDateTimeLabels(r);

    const cells = [
      r.id,
      dateStr,
      timeStr,
      entityName(r.learner as unknown),
      entityName(r.coach as unknown),
      entityName(r.programme as unknown),
      entityName(r.group as unknown),
      String(r.totalDurationMin),
      String(r.ragStatus),
      String(r.qualitativeRating),
      r.safeguardingFlagged ? 'Yes' : 'No',
      String(r.satisfactionScore),
      r.communicatedTo.employer ? 'Yes' : 'No',
      r.communicatedTo.learner ? 'Yes' : 'No',
      r.communicatedTo.qa ? 'Yes' : 'No',
    ];
    return cells.map((c) => csvEscape(String(c)));
  });

  const csv = [headers.map(csvEscape).join(','), ...rows.map((line) => line.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenameBase}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
