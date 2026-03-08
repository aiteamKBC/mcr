// MCR Review Types

export type RagStatus = 'Red' | 'Amber' | 'Green';
export type QualitativeRating = 'Outstanding' | 'Good' | 'Requires Improvement' | 'Inadequate';
export type TriStateStatus = 'Met' | 'Partially Met' | 'Not Met';
export type RecipientType = 'Employer' | 'Learner' | 'QA';
export type DeliveryStatus = 'Sent' | 'Pending' | 'Failed' | 'Delivered';
export type UserRole = 'admin' | 'qa' | 'coach' | 'employer' | 'learner';

// Main MCR Review
export interface McrReview {
  id: string;
  date: string;
  coach: string;
  learner: string;
  programme: string;
  group: string;
  meetingLink: string;
  totalDurationMin: number;
  ragStatus: 'Red' | 'Amber' | 'Green';
  qualitativeRating: string;
  createdAt: string;
  updatedAt: string;
  safeguardingFlagged: boolean;
  satisfactionScore: number;
  overallQaScore: number;
  communicatedTo: {
    employer: boolean;
    learner: boolean;
    qa: boolean;
  };
  meetingSections?: MeetingSectionTiming[];
  qaIndicators?: QaIndicatorEvaluation[];
  safeguardingChecklist?: SafeguardingChecklistItem[];
  satisfaction?: Satisfaction;
  evidenceItems?: EvidenceItem[];
  transcriptEvidence?: TranscriptEvidenceItem[];
  overallSummary?: OverallSummary;
  attachments?: Attachment[];
  communicationLog?: CommunicationLogEntry[];
}

// Meeting Section Timing
export interface MeetingSectionTiming {
  sectionKey: string;
  sectionName: string;
  plannedMin: number;
  actualMin: number;
  notes: string;
}

// QA Indicator Evaluation
export interface QaIndicatorEvaluation {
  indicatorKey: string;
  indicatorName: string;
  score0to5: number;
  status: TriStateStatus;
  comments: string;
  evidenceUrls: string[];
}

// Safeguarding Checklist Item
export interface SafeguardingChecklistItem {
  key: string;
  label: string;
  status: TriStateStatus;
  notes: string;
}

// Satisfaction
export interface Satisfaction {
  score0to5: number;
  comments: string;
}

// Evidence Item
export interface EvidenceItem {
  title: string;
  description: string;
  verified: boolean;
  ksbTags: ('K' | 'S' | 'B')[];
  epaTopics: string[];
  links: string[];
}

export interface TranscriptEvidenceItem {
  timestamp: string;
  speaker: string;
  text: string;
  metric?: string;
  whyItMatters?: string;
}

export interface OverallSummary {
  executiveSummary: string;
  strengths: string[];
  areasForDevelopment: string[];
  professionalJudgement: string;
}

// Attachment
export interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

// Communication Log Entry
export interface CommunicationLogEntry {
  id: string;
  recipientType: RecipientType;
  sentAt: string;
  sentBy: string;
  status: DeliveryStatus;
  notes: string;
}

// Current User
export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

// MCR Review Detail (full detail page data)
export interface McrReviewDetail extends McrReview {
  meetingSections: MeetingSectionTiming[];
  qaIndicators: QaIndicatorEvaluation[];
  safeguardingChecklist: SafeguardingChecklistItem[];
  satisfaction: Satisfaction;
  evidenceItems: EvidenceItem[];
  attachments: Attachment[];
  communicationLog: CommunicationLogEntry[];
  overallSummary: {
    executiveSummary: string;
    strengths: string[];
    areasForDevelopment: string[];
    professionalJudgement: string;
  };
}

// Dashboard Types
export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  coachId?: string;
  programmeId?: string;
  groupId?: string;
  ragStatus?: RagStatus;
  qualitativeRating?: string;
}

export interface DashboardKpis {
  totalMcrs: number;
  ragDistribution: {
    green: number;
    amber: number;
    red: number;
  };
  averageQaScore: number;
  safeguardingCompletionRate: number;
  averageSatisfaction: number;
}

export interface DashboardCharts {
  volumeOverTime: Array<{
    period: string;
    count: number;
  }>;
  ragOverTime: Array<{
    period: string;
    green: number;
    amber: number;
    red: number;
  }>;
  qaIndicatorsTrends: Array<{
    period: string;
    duration: number;
    welcomeStudent: number;
    presentationQuality: number;
    feedbackQuality: number;
    ksbVerified: number;
    epaTopics: number;
    satisfaction: number;
    safeguarding: number;
  }>;
}

export interface RecentActivity {
  reviewId: string;
  learnerName: string;
  coachName: string;
  programmeName: string;
  ragStatus: RagStatus;
  updatedAt: string;
}

export interface DashboardMetrics {
  kpis: DashboardKpis;
  charts: DashboardCharts;
  recentActivity: RecentActivity[];
}

export interface FilterOptions {
  coaches: Array<{ id: string; name: string }>;
  programmes: Array<{ id: string; name: string }>;
  groups: Array<{ id: string; name: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard Metrics Response
export interface DashboardMetricsResponse {
  kpis: DashboardKpis;
  charts: DashboardCharts;
  recentActivity: RecentActivity[];
}

// Reviews List Filters
export interface ReviewsFilters {
  page: number;
  pageSize: number;
  dateFrom?: string;
  dateTo?: string;
  coachId?: string;
  programmeId?: string;
  groupId?: string;
  ragStatus?: RagStatus;
  qualitativeRating?: QualitativeRating;
  safeguardingFlagged?: boolean;
  satisfactionLow?: boolean;
  search?: string;
}

