import { format } from 'date-fns';
import type { McrReview } from '../types/mcr';

/** Labels for reviews list: avoids UTC-midnight shift on date-only strings. */
export function meetingListDateTimeLabels(review: McrReview): { date: string; time: string } {
  if (review.meetingStartsAt) {
    const d = new Date(review.meetingStartsAt);
    if (!Number.isNaN(d.getTime())) {
      return {
        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      };
    }
  }

  const day = review.meetingDayDate?.trim() || extractYyyyMmDd(review.date);
  if (day) {
    const [y, m, d] = day.split('-').map((n) => Number(n));
    if (y && m && d) {
      const local = new Date(y, m - 1, d);
      return {
        date: local.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: '-',
      };
    }
  }

  const d = new Date(review.date);
  if (!Number.isNaN(d.getTime())) {
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
  }

  return { date: String(review.date || '-'), time: '' };
}

/** Detail header: line like "27 Mar 2026, 14:30" or date only if no clock time. */
export function formatReviewMeetingForHeader(review: McrReview): string {
  if (review.meetingStartsAt) {
    const d = new Date(review.meetingStartsAt);
    if (!Number.isNaN(d.getTime())) return format(d, 'dd MMM yyyy, HH:mm');
  }

  const day = review.meetingDayDate?.trim() || extractYyyyMmDd(review.date);
  if (day) {
    const [y, m, dd] = day.split('-').map((n) => Number(n));
    if (y && m && dd) {
      const local = new Date(y, m - 1, dd);
      return format(local, 'dd MMM yyyy');
    }
  }

  const d = new Date(review.date);
  if (!Number.isNaN(d.getTime())) return format(d, 'dd MMM yyyy, HH:mm');
  return String(review.date || '-');
}

export function extractYyyyMmDd(value: string): string | null {
  const s = String(value || '').trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}
