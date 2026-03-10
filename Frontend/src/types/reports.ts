export interface ReportRecord {
  id: number;
  status: 'completed' | 'failed' | 'pending' | 'processing';
  error: string | null;
  summary_json: SummaryJson | null;
  summary_text: string | null;
  model: string;
  prompt_version: string;
  input_chars: number;
  output_chars: number;
  created_at: string;
  booking_id: string;
  report_html: string | null;
}

export interface SummaryJson {
  date: string;
  coach: string;
  learner: string;
  duration: string;
  duration_inferred_minutes: number;
  duration_score_1_to_5: number;
  employer: string;
  programme: string;
  Group: string;
  executive_summary: string;
  strengths: string[];
  priority_actions: PriorityAction[];
  overall_rating: OverallRating;
  qa: QaMetric[];
}

export interface PriorityAction {
  owner: string;
  action: string;
  due: string;
}

export interface OverallRating {
  rag: 'Green' | 'Amber' | 'Red';
  qualitative: string;
  average_rating: number;
  professional_judgement: string;
}

export interface QaMetric {
  metric: string;
  result: string;
  rating_1_to_5: number;
  rag: 'Green' | 'Amber' | 'Red';
  notes: string;
  evidence: Evidence[];
}

export interface Evidence {
  timecode: string;
  speaker: string;
  quote: string;
  why_it_matters: string;
}

export interface ReportFilters {
  status?: string;
  model?: string;
  prompt_version?: string;
  date_from?: string;
  date_to?: string;
  rag?: string;
  booking_id?: string;
  page?: number;
  page_size?: number;
}

export interface ReportStats {
  total_reports: number;
  completed_count: number;
  failed_count: number;
  pending_count: number;
  processing_count: number;
  success_rate: number;
  avg_output_chars: number;
  rag_distribution: {
    green: number;
    amber: number;
    red: number;
  };
  avg_qa_score: number;
  daily_volume: Array<{
    date: string;
    completed: number;
    failed: number;
    pending: number;
    processing: number;
  }>;
  model_performance: Array<{
    model: string;
    count: number;
    success_rate: number;
    avg_output_chars: number;
    avg_qa_score: number;
  }>;
}

export interface ReportListResponse {
  results: ReportRecord[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ReportDashboardKpis {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  processing: number;
  inQueue: number;
  successRate: number;
  failureRate: number;
  ragGreen: number;
  ragAmber: number;
  ragRed: number;
  avgQaScore: number;
  avgInputChars: number;
  avgOutputChars: number;
  // Trend indicators (vs previous period)
  totalTrend?: number;
  successRateTrend?: number;
  failedTrend?: number;
  avgQaScoreTrend?: number;
}

export type ReportStatus = 'completed' | 'failed' | 'pending' | 'processing' | 'all';

export interface ReportDashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: ReportStatus;
  model?: string;
  prompt_version?: string;
  rag?: 'Green' | 'Amber' | 'Red' | 'all';
  booking_id?: string;
}