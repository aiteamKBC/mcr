// MCR file header: Frontend\src\utils\mcrApiClient.ts
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import axios from 'axios';
import type {
  Attachment,
  McrReview,
  McrReviewDetail,
  PaginatedResponse,
  ReviewsFilters,
  FilterOptions,
  DashboardMetrics,
  DashboardFilters,
  TranscriptEvidenceItem,
} from '../types/mcr';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCKS = String(import.meta.env.VITE_USE_MCR_MOCKS || 'false').toLowerCase() === 'true';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DISPLAY_CUTOFF_DATE = '2026-03-01';

type RawQaItem = {
  metric?: string;
  rating_1_to_5?: number | string;
  rag?: string;
  notes?: string;
  result?: string;
  evidence?: unknown[];
};

type RawQaEvidence = {
  timecode?: string;
  timestamp?: string;
  speaker?: string;
  quote?: string;
  text?: string;
  why_it_matters?: string;
  whyItMatters?: string;
};

type RawOverallRating = {
  rag?: string;
  qualitative?: string;
  average_rating?: number | string;
  professional_judgement?: string;
};

type RawAttachment = {
  id?: number | string;
  name?: string;
  url?: string;
  download_url?: string;
  downloadUrl?: string;
  type?: string;
  size?: number;
  uploaded_at?: string;
  uploadedAt?: string;
  uploaded_by?: string;
  uploadedBy?: string;
  visible_to_learner?: boolean;
  visibleToLearner?: boolean;
};

type RawReview = {
  id: number | string;
  date?: string;
  programme?: string;
  group?: string;
  meeting_link?: string;
  total_duration_min?: number | string;
  coach_name?: string;
  learner_name?: string;
  rag_status?: string;
  qualitative_rating?: string;
  created_at?: string;
  updated_at?: string;
  safeguarding_flagged?: boolean;
  satisfaction_score?: number | string | null;
  executive_summary?: string;
  strengths?: string[];
  priority_actions?: Array<{ action?: string }>;
  overall_rating?: RawOverallRating;
  qa?: RawQaItem[];
  attachments?: RawAttachment[];
  meeting_day_date?: string | null;
  meeting_starts_at?: string | null;
};

type QaTrendVector = {
  duration: number;
  welcomeStudent: number;
  presentationQuality: number;
  feedbackQuality: number;
  ksbVerified: number;
  epaTopics: number;
  satisfaction: number;
  safeguarding: number;
};

const EMPTY_QA_VECTOR: QaTrendVector = {
  duration: 0,
  welcomeStudent: 0,
  presentationQuality: 0,
  feedbackQuality: 0,
  ksbVerified: 0,
  epaTopics: 0,
  satisfaction: 0,
  safeguarding: 0,
};

export const mcrApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampScore = (value: unknown): number => {
  const score = toNumber(value, 0);
  return Math.max(0, Math.min(5, score));
};

const normalizeDisplayComment = (value: unknown): string => {
  const text = String(value || '').trim();
  if (!text) return '';

  const lower = text.toLowerCase();
  if (['yes', 'no', 'n/a', 'na', 'met', 'not met', 'green', 'amber', 'red'].includes(lower)) {
    return '';
  }

  return text;
};

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';

const toEntity = (prefix: string, name: string) => ({
  id: `${prefix}-${toSlug(name)}`,
  name: name || 'Unknown',
});

const toTitleCaseWords = (value: string): string =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      if (word.length <= 1) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

const normalizeLearnerDisplayName = (value: unknown, fallback = 'Unknown Learner'): string => {
  const raw = String(value || '').trim();
  if (!raw) return fallback;

  let candidate = raw;

  if (candidate.includes('|')) {
    candidate = candidate.split('|')[0].trim();
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)) {
    candidate = candidate.split('@')[0].trim();
  }

  candidate = candidate
    .replace(/[._]+/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!/[A-Za-z]/.test(candidate)) {
    return fallback;
  }

  return toTitleCaseWords(candidate) || fallback;
};

const normalizeRagLower = (value: unknown): 'green' | 'amber' | 'red' => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'green') return 'green';
  if (v === 'red') return 'red';
  return 'amber';
};

const normalizeRagTitle = (value: unknown): 'Green' | 'Amber' | 'Red' => {
  const rag = normalizeRagLower(value);
  if (rag === 'green') return 'Green';
  if (rag === 'red') return 'Red';
  return 'Amber';
};

const toTriState = (value: unknown): 'Met' | 'Partially Met' | 'Not Met' => {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'green' || v === 'met') return 'Met';
  if (v === 'red' || v === 'not_met' || v === 'not met') return 'Not Met';
  return 'Partially Met';
};

const toBinarySafeguardingStatus = (value: unknown): 'Met' | 'Not Met' => {
  const v = String(value || '').trim().toLowerCase();
  return v === 'green' || v === 'met' ? 'Met' : 'Not Met';
};


const deriveListRating = (rawRating: unknown, score: number): 'Outstanding' | 'Good' | 'Requires Improvement' | 'Inadequate' => {
  const text = String(rawRating || '').toLowerCase();
  if (text.includes('outstanding') || score >= 4.5) return 'Outstanding';
  if (text.includes('inadequate') || text.includes('cause for concern') || score < 2.5) return 'Inadequate';
  if (text.includes('requires') || text.includes('improvement') || score < 3.5) return 'Requires Improvement';
  return 'Good';
};

const deriveDetailRating = (listRating: string): 'Outstanding' | 'Strong' | 'Requires Improvement' | 'Cause for Concern' => {
  if (listRating === 'Outstanding') return 'Outstanding';
  if (listRating === 'Good') return 'Strong';
  if (listRating === 'Inadequate') return 'Cause for Concern';
  return 'Requires Improvement';
};

const metricToIndicatorKey = (metric: string): string => {
  const m = metric.toLowerCase();
  if (m.includes('duration')) return 'qa_duration';
  if (m.includes('welcome')) return 'qa_welcome';
  if (m.includes('presentation')) return 'qa_presentation';
  if (m.includes('feedback')) return 'qa_feedback';
  if (m.includes('ksb')) return 'qa_ksb_evidence';
  if (m.includes('epa')) return 'qa_epa_topics';
  if (m.includes('satisfaction')) return 'qa_satisfaction';
  if (m.includes('safeguarding')) return 'qa_safeguarding';
  return `qa_${toSlug(metric || 'indicator')}`;
};

const extractEvidenceUrls = (evidence: unknown[]): string[] => {
  const urls: string[] = [];
  evidence.forEach((item) => {
    if (typeof item === 'string' && /^https?:\/\//i.test(item)) {
      urls.push(item);
      return;
    }
    if (item && typeof item === 'object') {
      const maybe = item as Record<string, unknown>;
      const candidates = [maybe.url, maybe.link, maybe.href];
      candidates.forEach((candidate) => {
        if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate)) {
          urls.push(candidate);
        }
      });
    }
  });
  return urls;
};

const mapAttachment = (attachment: RawAttachment): Attachment => ({
  id: attachment.id != null ? String(attachment.id) : undefined,
  name: String(attachment.name || 'Attachment'),
  url: String(attachment.url || '#'),
  downloadUrl: String(attachment.downloadUrl || attachment.download_url || attachment.url || '#'),
  type: String(attachment.type || 'file'),
  size: toNumber(attachment.size, 0),
  uploadedAt: String(attachment.uploadedAt || attachment.uploaded_at || ''),
  uploadedBy: String(attachment.uploadedBy || attachment.uploaded_by || ''),
  visibleToLearner:
    attachment.visibleToLearner !== undefined
      ? Boolean(attachment.visibleToLearner)
      : attachment.visible_to_learner !== undefined
      ? Boolean(attachment.visible_to_learner)
      : true,
});

const mapQaIndicators = (qaItems: RawQaItem[]) => {
  return qaItems.map((item, idx) => {
    const metric = String(item.metric || `Indicator ${idx + 1}`);
    const score = clampScore(item.rating_1_to_5);
    return {
      indicatorKey: metricToIndicatorKey(metric),
      indicatorName: metric,
      score0to5: score,
      score,
      status: toTriState(item.rag),
      comments: String(item.notes || item.result || ''),
      evidenceUrls: extractEvidenceUrls(asArray<unknown>(item.evidence)),
    };
  });
};

const timecodeToSeconds = (value: string): number => {
  const parts = value.split(':').map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return Number.MAX_SAFE_INTEGER;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number.MAX_SAFE_INTEGER;
};

const mapTranscriptEvidence = (qaItems: RawQaItem[]): TranscriptEvidenceItem[] => {
  const byKey = new Map<string, TranscriptEvidenceItem & { metricSet: Set<string>; order: number }>();
  let order = 0;

  qaItems.forEach((qaItem) => {
    const metric = String(qaItem.metric || 'General');
    asArray<unknown>(qaItem.evidence).forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const raw = entry as RawQaEvidence;
      const timestamp = String(raw.timecode || raw.timestamp || '').trim();
      const speaker = String(raw.speaker || 'Unknown').trim();
      const text = String(raw.quote || raw.text || '').trim();
      const whyItMatters = String(raw.why_it_matters || raw.whyItMatters || '').trim();

      if (!text) return;

      const safeTimestamp = timestamp || 'N/A';
      const key = `${safeTimestamp}|${speaker}|${text}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.metricSet.add(metric);
        if (!existing.whyItMatters && whyItMatters) {
          existing.whyItMatters = whyItMatters;
        }
        return;
      }

      byKey.set(key, {
        timestamp: safeTimestamp,
        speaker,
        text,
        whyItMatters,
        metric,
        metricSet: new Set([metric]),
        order: order++,
      });
    });
  });

  return Array.from(byKey.values())
    .sort((a, b) => {
      const byTimestamp = timecodeToSeconds(a.timestamp) - timecodeToSeconds(b.timestamp);
      if (byTimestamp !== 0) return byTimestamp;
      return a.order - b.order;
    })
    .map(({ metricSet, order: _order, ...item }) => ({
      ...item,
      metric: Array.from(metricSet).join(' | '),
    }));
};

const findQaItemByKeywords = (qaItems: RawQaItem[], keywords: string[]): RawQaItem | undefined => {
  return qaItems.find((item) => {
    const metric = String(item.metric || '').toLowerCase();
    return keywords.some((keyword) => metric.includes(keyword));
  });
};

const buildMeetingSections = (
  qaItems: RawQaItem[],
  totalDurationMin: number,
  executiveSummary: string
) => {
  const sections = [
    {
      sectionKey: 'opening_review',
      sectionName: 'Opening the Review Meeting',
      plannedMin: 5,
      qaKeywords: ['welcome'],
    },
    {
      sectionKey: 'learner_presentation_review',
      sectionName: 'Learner PowerPoint Presentation & Review',
      plannedMin: 15,
      qaKeywords: ['presentation', 'learner presentation'],
    },
    {
      sectionKey: 'reflection_ksb',
      sectionName: 'Reflection on Knowledge, Skills, and Behaviours',
      plannedMin: 10,
      qaKeywords: ['ksb'],
    },
    {
      sectionKey: 'environmental_analysis',
      sectionName: 'Preparing for 3 Month External & Internal Environmental Analysis',
      plannedMin: 10,
      qaKeywords: ['epa'],
    },
    {
      sectionKey: 'wellbeing_safeguarding',
      sectionName: 'Wellbeing & Safeguarding Check',
      plannedMin: 5,
      qaKeywords: ['safeguarding'],
    },
    {
      sectionKey: 'learner_feedback_teaching',
      sectionName: 'Learner Feedback on Teaching & Curriculum',
      plannedMin: 5,
      qaKeywords: ['feedback', 'satisfaction'],
    },
    {
      sectionKey: 'confirm_next_meeting_close',
      sectionName: 'Confirm Next Meeting & Close',
      plannedMin: 5,
      qaKeywords: ['duration'],
    },
  ];

  const totalPlanned = sections.reduce((sum, section) => sum + section.plannedMin, 0);
  let allocated = 0;

  return sections.map((section, index) => {
    const isLast = index === sections.length - 1;
    const estimatedActual = isLast
      ? Math.max(0, totalDurationMin - allocated)
      : Math.max(0, Math.round((section.plannedMin / totalPlanned) * totalDurationMin));

    allocated += estimatedActual;

    const qaItem = findQaItemByKeywords(qaItems, section.qaKeywords);
    const qaComment = String(qaItem?.notes || qaItem?.result || '').trim();
    const evidenceState = qaItem
      ? 'Evidenced via QA indicators.'
      : 'Not explicitly evidenced in transcript metadata.';

    const notes = [
      qaComment,
      evidenceState,
      'Timing per section is inferred from total meeting duration.',
      isLast && executiveSummary ? 'Close note: ' + executiveSummary : '',
    ]
      .filter(Boolean)
      .join(' ');

    return {
      sectionKey: section.sectionKey,
      sectionName: section.sectionName,
      plannedMin: section.plannedMin,
      actualMin: estimatedActual,
      notes,
    };
  });
};

const buildSafeguardingChecklist = (qaItems: RawQaItem[]) => {
  const safeguardingQa = findQaItemByKeywords(qaItems, ['safeguarding']);
  const status = toBinarySafeguardingStatus(safeguardingQa?.rag);
  const baseNotes = String(safeguardingQa?.notes || safeguardingQa?.result || '').trim();

  const principles = [
    { key: 'safe_supportive_environment', label: 'Creating a safe, supportive environment' },
    { key: 'open_supportive_wellbeing_questions', label: 'Asking open, supportive wellbeing questions' },
    { key: 'checking_non_verbal_cues', label: 'Checking for non-verbal cues' },
    { key: 'light_touch_safeguarding_checklist', label: 'Using a light-touch safeguarding checklist' },
    { key: 'awareness_safeguarding_indicators', label: 'Awareness of safeguarding indicators' },
    { key: 'reassurance_confidentiality', label: 'Offering correct reassurance about confidentiality' },
    { key: 'signposting_support', label: 'Signposting support correctly' },
    { key: 'documenting_escalating_concerns', label: 'Documenting and escalating concerns appropriately' },
  ];

  return principles.map((item) => ({
    key: item.key,
    label: item.label,
    status,
    notes: [baseNotes, 'Assessed via QA Safeguarding (APTEM) indicator.'].filter(Boolean).join(' '),
  }));
};

const qaToTrendVector = (qaItems: RawQaItem[]): QaTrendVector => {
  const out: QaTrendVector = { ...EMPTY_QA_VECTOR };
  qaItems.forEach((qa) => {
    const score = clampScore(qa.rating_1_to_5);
    const metric = String(qa.metric || '').toLowerCase();
    if (metric.includes('duration')) out.duration = score;
    else if (metric.includes('welcome')) out.welcomeStudent = score;
    else if (metric.includes('presentation')) out.presentationQuality = score;
    else if (metric.includes('feedback')) out.feedbackQuality = score;
    else if (metric.includes('ksb')) out.ksbVerified = score;
    else if (metric.includes('epa')) out.epaTopics = score;
    else if (metric.includes('satisfaction')) out.satisfaction = score;
    else if (metric.includes('safeguarding')) out.safeguarding = score;
  });
  return out;
};

const monthLabel = (dateString: string): string => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return MONTHS[d.getMonth()];
};

const monthPeriodKey = (dateString: string): string => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'unknown';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const monthPeriodLabel = (periodKey: string, includeYear: boolean): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(periodKey);
  if (!match) return 'Unknown';

  const year = match[1];
  const monthIndex = Number(match[2]) - 1;
  const month = MONTHS[monthIndex] || 'Unknown';

  return includeYear ? `${month} ${year}` : month;
};

const safeIsoDate = (value: string | undefined, fallback = new Date().toISOString()): string => {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
};

const toIsoDateKey = (value: unknown): string => {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);

  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const reviewPassesDisplayCutoff = (raw: RawReview): boolean => {
  const reviewDate = toIsoDateKey(raw.meeting_day_date || raw.date || raw.created_at);
  return !reviewDate || reviewDate >= DISPLAY_CUTOFF_DATE;
};

const avgQaScoreFromIndicators = (qaIndicators: Array<{ score0to5: number }>): number => {
  if (qaIndicators.length === 0) return 0;
  return qaIndicators.reduce((sum, item) => sum + item.score0to5, 0) / qaIndicators.length;
};

const normalizeMeetingFields = (
  raw: RawReview
): { date: string; meetingDayDate: string | null; meetingStartsAt: string | null } => {
  const meetingStartsAt = raw.meeting_starts_at ? String(raw.meeting_starts_at).trim() : null;
  const meetingDayDate = raw.meeting_day_date
    ? String(raw.meeting_day_date).trim().slice(0, 10)
    : null;

  if (meetingStartsAt) {
    return {
      date: meetingStartsAt,
      meetingDayDate: meetingDayDate ?? null,
      meetingStartsAt,
    };
  }
  if (meetingDayDate) {
    return {
      date: `${meetingDayDate}T00:00:00`,
      meetingDayDate,
      meetingStartsAt: null,
    };
  }
  const legacy = raw.date != null && raw.date !== '' ? String(raw.date).trim() : '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(legacy)) {
    return {
      date: `${legacy}T00:00:00`,
      meetingDayDate: legacy,
      meetingStartsAt: null,
    };
  }
  return {
    date: legacy || safeIsoDate(raw.created_at),
    meetingDayDate: null,
    meetingStartsAt: null,
  };
};

const mapListReview = (raw: RawReview): McrReview => {
  const qaItems = asArray<RawQaItem>(raw.qa);
  const qaIndicators = mapQaIndicators(qaItems);
  const qaAverage = avgQaScoreFromIndicators(qaIndicators);
  const listRating = deriveListRating(raw.qualitative_rating || raw.overall_rating?.qualitative, qaAverage);

  const coachName = String(raw.coach_name || 'Unknown Coach');
  const learnerName = normalizeLearnerDisplayName(raw.learner_name);
  const programmeName = String(raw.programme || 'Unknown Programme');
  const groupName = String(raw.group || 'Unknown Group');
  const meeting = normalizeMeetingFields(raw);

  return {
    id: String(raw.id),
    date: meeting.date,
    meetingDayDate: meeting.meetingDayDate,
    meetingStartsAt: meeting.meetingStartsAt,
    coach: toEntity('coach', coachName) as any,
    learner: toEntity('learner', learnerName) as any,
    programme: toEntity('programme', programmeName) as any,
    group: toEntity('group', groupName) as any,
    meetingLink: String(raw.meeting_link || ''),
    totalDurationMin: toNumber(raw.total_duration_min, 0),
    ragStatus: normalizeRagLower(raw.rag_status) as any,
    qualitativeRating: listRating,
    createdAt: safeIsoDate(raw.created_at),
    updatedAt: safeIsoDate(raw.updated_at || raw.created_at),
    safeguardingFlagged: Boolean(raw.safeguarding_flagged),
    satisfactionScore: clampScore(raw.satisfaction_score),
    overallQaScore: Number(qaAverage.toFixed(2)),
  } as McrReview;
};

const mapDetailReview = (raw: RawReview): McrReview => {
  const qaItems = asArray<RawQaItem>(raw.qa);
  const qaIndicators = mapQaIndicators(qaItems);
  const qaAverage = avgQaScoreFromIndicators(qaIndicators);
  const listRating = deriveListRating(raw.qualitative_rating || raw.overall_rating?.qualitative, qaAverage);
  const detailRating = deriveDetailRating(listRating);
  const safeguardingQa = qaItems.find((item) => String(item.metric || '').toLowerCase().includes('safeguarding'));
  const satisfactionQa = qaItems.find((item) => String(item.metric || '').toLowerCase().includes('satisfaction'));
  const transcriptEvidence = mapTranscriptEvidence(qaItems);

  const totalDurationMin = toNumber(raw.total_duration_min, 0);

  const meetingSections = buildMeetingSections(
    qaItems,
    totalDurationMin,
    String(raw.executive_summary || '')
  );

  const safeguardingChecklist = buildSafeguardingChecklist(qaItems);

  const areasForDevelopment = asArray<{ action?: string }>(raw.priority_actions)
    .map((item) => String(item.action || '').trim())
    .filter(Boolean);

  const summary = {
    overallRating: detailRating,
    executiveSummary: String(raw.executive_summary || ''),
    strengths: asArray<string>(raw.strengths),
    areasForDevelopment,
    professionalJudgement: String(raw.overall_rating?.professional_judgement || ''),
  };

  const score0to5 = clampScore(satisfactionQa?.rating_1_to_5 ?? raw.satisfaction_score);
  const meeting = normalizeMeetingFields(raw);

  const mapped = {
    id: String(raw.id),
    date: meeting.date,
    meetingDayDate: meeting.meetingDayDate,
    meetingStartsAt: meeting.meetingStartsAt,
    coach: String(raw.coach_name || ''),
    learner: normalizeLearnerDisplayName(raw.learner_name, ''),
    programme: String(raw.programme || ''),
    group: String(raw.group || ''),
    meetingLink: String(raw.meeting_link || ''),
    totalDurationMin: toNumber(raw.total_duration_min, 0),
    ragStatus: normalizeRagTitle(raw.rag_status),
    qualitativeRating: detailRating,
    createdAt: safeIsoDate(raw.created_at),
    updatedAt: safeIsoDate(raw.updated_at || raw.created_at),
    safeguardingFlagged: Boolean(raw.safeguarding_flagged),
    satisfactionScore: clampScore(raw.satisfaction_score),
    overallQaScore: Number(qaAverage.toFixed(2)),
    meetingSections,
    qaIndicators,
    safeguardingChecklist,
    satisfaction: {
      score0to5,
      score: score0to5,
      comments: normalizeDisplayComment(satisfactionQa?.notes) || normalizeDisplayComment(satisfactionQa?.result),
    },
    evidenceItems: [],
    transcriptEvidence,
    ksbEvidence: [],
    overallSummary: summary,
    attachments: asArray<RawAttachment>(raw.attachments).map(mapAttachment),
  } as McrReview;

  return mapped;
};

const filterMappedReviews = (reviews: McrReview[], filters?: ReviewsFilters): McrReview[] => {
  if (!filters) return reviews;
  const ragFilter = filters.ragStatus ? normalizeRagLower(filters.ragStatus) : undefined;
  const qualitativeFilter = String(filters.qualitativeRating || '').toLowerCase();
  const search = String(filters.search || '').trim().toLowerCase();

  return reviews.filter((review) => {
    const dateValue = String(review.date || '').slice(0, 10);
    const coachId = String((review as any).coach?.id || '');
    const programmeId = String((review as any).programme?.id || '');
    const groupId = String((review as any).group?.id || '');
    const coachName = String((review as any).coach?.name || '').toLowerCase();
    const learnerName = String((review as any).learner?.name || '').toLowerCase();
    const programmeName = String((review as any).programme?.name || '').toLowerCase();

    if (filters.dateFrom && dateValue < filters.dateFrom) return false;
    if (filters.dateTo && dateValue > filters.dateTo) return false;
    if (filters.coachId && coachId !== filters.coachId) return false;
    if (filters.programmeId && programmeId !== filters.programmeId) return false;
    if (filters.groupId && groupId !== filters.groupId) return false;
    if (ragFilter && normalizeRagLower((review as any).ragStatus) !== ragFilter) return false;
    if (qualitativeFilter && !String(review.qualitativeRating || '').toLowerCase().includes(qualitativeFilter)) return false;
    if (filters.safeguardingFlagged !== undefined && Boolean(review.safeguardingFlagged) !== filters.safeguardingFlagged) return false;
    if (filters.satisfactionLow && toNumber(review.satisfactionScore, 0) >= 3) return false;
    if (
      search &&
      !coachName.includes(search) &&
      !learnerName.includes(search) &&
      !programmeName.includes(search)
    ) {
      return false;
    }
    return true;
  });
};

const toDashboardFiltersAsReviewFilters = (filters?: DashboardFilters): ReviewsFilters => ({
  page: 1,
  pageSize: 100000,
  dateFrom: filters?.dateFrom,
  dateTo: filters?.dateTo,
  coachId: filters?.coachId,
  programmeId: filters?.programmeId,
  groupId: filters?.groupId,
  ragStatus: filters?.ragStatus,
  qualitativeRating: filters?.qualitativeRating as any,
});

const sortedByUpdatedDesc = (reviews: McrReview[]): McrReview[] =>
  reviews.slice().sort((a, b) => new Date((b as any).updatedAt).getTime() - new Date((a as any).updatedAt).getTime());

const buildFilterOptionsFromReviews = (reviews: McrReview[]): FilterOptions => {
  const coachMap = new Map<string, { id: string; name: string }>();
  const programmeMap = new Map<string, { id: string; name: string }>();
  const groupMap = new Map<string, { id: string; name: string }>();

  reviews.forEach((review) => {
    const coach = (review as any).coach;
    const programme = (review as any).programme;
    const group = (review as any).group;
    if (coach?.id && coach?.name) coachMap.set(coach.id, coach);
    if (programme?.id && programme?.name) programmeMap.set(programme.id, programme);
    if (group?.id && group?.name) groupMap.set(group.id, group);
  });

  const sortByName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

  return {
    coaches: Array.from(coachMap.values()).sort(sortByName),
    programmes: Array.from(programmeMap.values()).sort(sortByName),
    groups: Array.from(groupMap.values()).sort(sortByName),
  };
};

const buildDashboardMetrics = (rawReviews: RawReview[], filters?: DashboardFilters): DashboardMetrics => {
  const mappedList = rawReviews.map(mapListReview);
  const filtered = filterMappedReviews(mappedList, toDashboardFiltersAsReviewFilters(filters));

  const total = filtered.length;
  const green = filtered.filter((review) => normalizeRagLower((review as any).ragStatus) === 'green').length;
  const amber = filtered.filter((review) => normalizeRagLower((review as any).ragStatus) === 'amber').length;
  const red = filtered.filter((review) => normalizeRagLower((review as any).ragStatus) === 'red').length;

  const averageQaScore =
    total > 0 ? filtered.reduce((sum, review) => sum + toNumber((review as any).overallQaScore, 0), 0) / total : 0;
  const averageSatisfaction =
    total > 0 ? filtered.reduce((sum, review) => sum + toNumber(review.satisfactionScore, 0), 0) / total : 0;
  const safeguardingCompletionRate =
    total > 0 ? Math.round((filtered.filter((review) => !review.safeguardingFlagged).length / total) * 100) : 0;

  const filteredIdSet = new Set(filtered.map((review) => String(review.id)));
  const filteredRaw = rawReviews.filter((review) => filteredIdSet.has(String(review.id)));

  const volumeMap = new Map<string, number>();
  const ragMap = new Map<string, { green: number; amber: number; red: number }>();
  const qaMap = new Map<string, { count: number; totals: QaTrendVector }>();
  const periodYears = new Set<string>();

  filteredRaw.forEach((review) => {
    const sourceDate = String(review.date || review.created_at || new Date().toISOString());
    const periodKey = monthPeriodKey(sourceDate);
    const periodLabel = monthLabel(sourceDate);

    if (periodKey !== 'unknown') {
      periodYears.add(periodKey.slice(0, 4));
    } else if (periodLabel !== 'Unknown') {
      periodYears.add(String(new Date(sourceDate).getFullYear()));
    }

    volumeMap.set(periodKey, (volumeMap.get(periodKey) || 0) + 1);

    const rag = normalizeRagLower(review.rag_status);
    const ragBucket = ragMap.get(periodKey) || { green: 0, amber: 0, red: 0 };
    ragBucket[rag] += 1;
    ragMap.set(periodKey, ragBucket);

    const qaVector = qaToTrendVector(asArray<RawQaItem>(review.qa));
    const qaBucket = qaMap.get(periodKey) || { count: 0, totals: { ...EMPTY_QA_VECTOR } };
    qaBucket.count += 1;
    qaBucket.totals.duration += qaVector.duration;
    qaBucket.totals.welcomeStudent += qaVector.welcomeStudent;
    qaBucket.totals.presentationQuality += qaVector.presentationQuality;
    qaBucket.totals.feedbackQuality += qaVector.feedbackQuality;
    qaBucket.totals.ksbVerified += qaVector.ksbVerified;
    qaBucket.totals.epaTopics += qaVector.epaTopics;
    qaBucket.totals.satisfaction += qaVector.satisfaction;
    qaBucket.totals.safeguarding += qaVector.safeguarding;
    qaMap.set(periodKey, qaBucket);
  });

  const includeYearInPeriodLabel = periodYears.size > 1;

  const sortedVolumeEntries = Array.from(volumeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  const sortedRagEntries = Array.from(ragMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  const sortedQaEntries = Array.from(qaMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12);

  const volumeOverTime = sortedVolumeEntries.map(([periodKey, count]) => ({
      period: monthPeriodLabel(periodKey, includeYearInPeriodLabel),
      count,
    }));

  const ragOverTime = sortedRagEntries.map(([periodKey, value]) => ({
      period: monthPeriodLabel(periodKey, includeYearInPeriodLabel),
      ...value,
    }));

  const qaIndicatorsTrends = sortedQaEntries.map(([periodKey, value]) => ({
      period: monthPeriodLabel(periodKey, includeYearInPeriodLabel),
      duration: Number((value.totals.duration / value.count).toFixed(1)),
      welcomeStudent: Number((value.totals.welcomeStudent / value.count).toFixed(1)),
      presentationQuality: Number((value.totals.presentationQuality / value.count).toFixed(1)),
      feedbackQuality: Number((value.totals.feedbackQuality / value.count).toFixed(1)),
      ksbVerified: Number((value.totals.ksbVerified / value.count).toFixed(1)),
      epaTopics: Number((value.totals.epaTopics / value.count).toFixed(1)),
      satisfaction: Number((value.totals.satisfaction / value.count).toFixed(1)),
      safeguarding: Number((value.totals.safeguarding / value.count).toFixed(1)),
    }));

  const recentActivity = sortedByUpdatedDesc(filtered)
    .slice(0, 8)
    .map((review) => ({
      reviewId: String(review.id),
      learnerName: String((review as any).learner?.name || ''),
      coachName: String((review as any).coach?.name || ''),
      programmeName: String((review as any).programme?.name || ''),
      ragStatus: normalizeRagTitle((review as any).ragStatus),
      updatedAt: String((review as any).updatedAt || new Date().toISOString()),
    }));

  return {
    kpis: {
      totalMcrs: total,
      ragDistribution: { green, amber, red },
      averageQaScore: Number(averageQaScore.toFixed(2)),
      safeguardingCompletionRate,
      averageSatisfaction: Number(averageSatisfaction.toFixed(2)),
    },
    charts: {
      volumeOverTime,
      ragOverTime,
      qaIndicatorsTrends,
    },
    recentActivity,
  };
};

const fetchRawReviews = async (): Promise<RawReview[]> => {
  if (USE_MOCKS) {
    console.warn('VITE_USE_MCR_MOCKS=true is set, but live backend mapping is being used.');
  }
  const response = await mcrApiClient.get<RawReview[]>('/api/mcr/reviews/');
  return asArray<RawReview>(response.data).filter(reviewPassesDisplayCutoff);
};

export async function getDashboardMetrics(filters?: DashboardFilters): Promise<DashboardMetrics> {
  const rawReviews = await fetchRawReviews();
  return buildDashboardMetrics(rawReviews, filters);
}

export const getReviews = async (filters?: ReviewsFilters): Promise<PaginatedResponse<McrReview>> => {
  const allMapped = (await fetchRawReviews()).map(mapListReview);
  const filtered = filterMappedReviews(allMapped, filters);

  const page = Math.max(1, toNumber(filters?.page, 1));
  const pageSize = Math.max(1, toNumber(filters?.pageSize, 10));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
};

export const getReviewById = async (id: string): Promise<McrReview> => {
  const response = await mcrApiClient.get<RawReview>(`/api/mcr/reviews/${id}/`);
  return mapDetailReview(response.data);
};

export const uploadReviewAttachment = async (
  reviewId: string,
  file: File,
  options?: { uploadedBy?: string; visibleToLearner?: boolean }
): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.uploadedBy) {
    formData.append('uploaded_by', options.uploadedBy);
  }
  if (options?.visibleToLearner !== undefined) {
    formData.append('visible_to_learner', String(options.visibleToLearner));
  }

  const response = await mcrApiClient.post<RawAttachment>(`/api/mcr/reviews/${reviewId}/attachments/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return mapAttachment(response.data);
};

export const deleteReviewAttachment = async (reviewId: string, attachmentId: string): Promise<void> => {
  await mcrApiClient.delete(`/api/mcr/reviews/${reviewId}/attachments/${attachmentId}/`);
};

export const exportReview = async (id: string): Promise<Blob> => {
  const response = await mcrApiClient.get(`/api/mcr/reviews/${id}/export/`, {
    responseType: 'blob',
  });
  return response.data;
};

export const updateReview = async (id: string, data: Partial<McrReviewDetail>) => {
  try {
    const response = await mcrApiClient.patch(`/api/mcr/reviews/${id}/`, data);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 405) {
      return { success: false, message: 'Update endpoint is not available on backend yet.' };
    }
    throw error;
  }
};

export const getFilterOptions = async (): Promise<FilterOptions> => {
  const mapped = (await fetchRawReviews()).map(mapListReview);
  return buildFilterOptionsFromReviews(mapped);
};

mcrApiClient.interceptors.request.use(
  (config) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

mcrApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);
