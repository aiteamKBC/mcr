import { 
  ReportRecord, 
  ReportStats, 
  ReportFilters,
  ReportListResponse,
  ReportDashboardKpis,
  ReportDashboardFilters
} from '../types/reports';
import { mockReportRecords } from '../mocks/mcr/reportRecords';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Helper to build query string from filters
const buildQueryString = (filters: ReportFilters): string => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.model) params.append('model', filters.model);
  if (filters.prompt_version) params.append('prompt_version', filters.prompt_version);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.rag) params.append('rag', filters.rag);
  if (filters.booking_id) params.append('booking_id', filters.booking_id);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.page_size) params.append('page_size', filters.page_size.toString());
  
  return params.toString();
};

// Mock implementation for filtering
const filterMockReports = (filters: ReportFilters): ReportRecord[] => {
  let filtered = [...mockReportRecords];
  
  if (filters.status) {
    filtered = filtered.filter(r => r.status === filters.status);
  }
  
  if (filters.model) {
    filtered = filtered.filter(r => r.model === filters.model);
  }
  
  if (filters.prompt_version) {
    filtered = filtered.filter(r => r.prompt_version === filters.prompt_version);
  }
  
  if (filters.rag && filters.rag !== 'all') {
    filtered = filtered.filter(r => r.summary_json?.overall_rating?.rag === filters.rag);
  }
  
  if (filters.booking_id) {
    filtered = filtered.filter(r => 
      r.booking_id.toLowerCase().includes(filters.booking_id!.toLowerCase())
    );
  }
  
  if (filters.date_from) {
    filtered = filtered.filter(r => r.created_at >= filters.date_from!);
  }
  
  if (filters.date_to) {
    filtered = filtered.filter(r => r.created_at <= filters.date_to!);
  }
  
  return filtered;
};

// Mock stats calculation
const calculateMockStats = (reports: ReportRecord[]): ReportStats => {
  const completed = reports.filter(r => r.status === 'completed');
  const failed = reports.filter(r => r.status === 'failed');
  const pending = reports.filter(r => r.status === 'pending');
  const processing = reports.filter(r => r.status === 'processing');
  
  const totalReports = reports.length;
  const completedCount = completed.length;
  const successRate = totalReports > 0 ? (completedCount / totalReports) * 100 : 0;
  
  const avgOutputChars = completed.length > 0
    ? completed.reduce((sum, r) => sum + r.output_chars, 0) / completed.length
    : 0;
  
  const ragDistribution = {
    green: completed.filter(r => r.summary_json?.overall_rating?.rag === 'Green').length,
    amber: completed.filter(r => r.summary_json?.overall_rating?.rag === 'Amber').length,
    red: completed.filter(r => r.summary_json?.overall_rating?.rag === 'Red').length,
  };
  
  const avgQaScore = completed.reduce((sum, r) => {
    if (!r.summary_json?.qa) return sum;
    const qaAvg = r.summary_json.qa.reduce((s, q) => s + q.rating_1_to_5, 0) / r.summary_json.qa.length;
    return sum + qaAvg;
  }, 0) / (completed.length || 1);
  
  // Generate daily volume for last 14 days
  const dailyVolume = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayReports = reports.filter(r => r.created_at.startsWith(dateStr));
    
    return {
      date: dateStr,
      completed: dayReports.filter(r => r.status === 'completed').length,
      failed: dayReports.filter(r => r.status === 'failed').length,
      pending: dayReports.filter(r => r.status === 'pending').length,
      processing: dayReports.filter(r => r.status === 'processing').length,
    };
  });
  
  // Model performance
  const modelMap = new Map<string, ReportRecord[]>();
  reports.forEach(r => {
    if (!modelMap.has(r.model)) modelMap.set(r.model, []);
    modelMap.get(r.model)!.push(r);
  });
  
  const modelPerformance = Array.from(modelMap.entries()).map(([model, modelReports]) => {
    const modelCompleted = modelReports.filter(r => r.status === 'completed');
    const modelSuccessRate = modelReports.length > 0 
      ? (modelCompleted.length / modelReports.length) * 100 
      : 0;
    
    const modelAvgOutput = modelCompleted.length > 0
      ? modelCompleted.reduce((sum, r) => sum + r.output_chars, 0) / modelCompleted.length
      : 0;
    
    const modelAvgQa = modelCompleted.reduce((sum, r) => {
      if (!r.summary_json?.qa) return sum;
      const qaAvg = r.summary_json.qa.reduce((s, q) => s + q.rating_1_to_5, 0) / r.summary_json.qa.length;
      return sum + qaAvg;
    }, 0) / (modelCompleted.length || 1);
    
    return {
      model,
      count: modelReports.length,
      success_rate: modelSuccessRate,
      avg_output_chars: modelAvgOutput,
      avg_qa_score: modelAvgQa,
    };
  });
  
  return {
    total_reports: totalReports,
    completed_count: completedCount,
    failed_count: failed.length,
    pending_count: pending.length,
    processing_count: processing.length,
    success_rate: successRate,
    avg_output_chars: avgOutputChars,
    rag_distribution: ragDistribution,
    avg_qa_score: avgQaScore,
    daily_volume: dailyVolume,
    model_performance: modelPerformance,
  };
};

/**
 * Calculate dashboard KPIs from report records
 */
export const calculateDashboardKpis = (
  records: ReportRecord[],
  previousRecords?: ReportRecord[]
): ReportDashboardKpis => {
  const total = records.length;
  const completed = records.filter((r) => r.status === 'completed').length;
  const failed = records.filter((r) => r.status === 'failed').length;
  const pending = records.filter((r) => r.status === 'pending').length;
  const processing = records.filter((r) => r.status === 'processing').length;
  const inQueue = pending + processing;

  const successRate = total > 0 ? (completed / total) * 100 : 0;
  const failureRate = total > 0 ? (failed / total) * 100 : 0;

  // RAG distribution from summary_json
  const ragGreen = records.filter(
    (r) => r.summary_json?.overall_rating?.rag === 'Green'
  ).length;
  const ragAmber = records.filter(
    (r) => r.summary_json?.overall_rating?.rag === 'Amber'
  ).length;
  const ragRed = records.filter(
    (r) => r.summary_json?.overall_rating?.rag === 'Red'
  ).length;

  // Average QA score from summary_json.qa array
  const qaScores: number[] = [];
  records.forEach((r) => {
    if (r.summary_json?.qa && Array.isArray(r.summary_json.qa)) {
      r.summary_json.qa.forEach((qa) => {
        if (typeof qa.rating_1_to_5 === 'number') {
          qaScores.push(qa.rating_1_to_5);
        }
      });
    }
  });
  const avgQaScore = qaScores.length > 0 
    ? qaScores.reduce((sum, score) => sum + score, 0) / qaScores.length 
    : 0;

  // Average chars
  const avgInputChars = total > 0 
    ? records.reduce((sum, r) => sum + (r.input_chars || 0), 0) / total 
    : 0;
  const avgOutputChars = total > 0 
    ? records.reduce((sum, r) => sum + (r.output_chars || 0), 0) / total 
    : 0;

  // Calculate trends if previous period data is provided
  let totalTrend: number | undefined;
  let successRateTrend: number | undefined;
  let failedTrend: number | undefined;
  let avgQaScoreTrend: number | undefined;

  if (previousRecords && previousRecords.length > 0) {
    const prevTotal = previousRecords.length;
    const prevCompleted = previousRecords.filter((r) => r.status === 'completed').length;
    const prevFailed = previousRecords.filter((r) => r.status === 'failed').length;
    const prevSuccessRate = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;

    const prevQaScores: number[] = [];
    previousRecords.forEach((r) => {
      if (r.summary_json?.qa && Array.isArray(r.summary_json.qa)) {
        r.summary_json.qa.forEach((qa) => {
          if (typeof qa.rating_1_to_5 === 'number') {
            prevQaScores.push(qa.rating_1_to_5);
          }
        });
      }
    });
    const prevAvgQaScore = prevQaScores.length > 0 
      ? prevQaScores.reduce((sum, score) => sum + score, 0) / prevQaScores.length 
      : 0;

    totalTrend = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
    successRateTrend = prevSuccessRate > 0 ? successRate - prevSuccessRate : 0;
    failedTrend = prevFailed > 0 ? ((failed - prevFailed) / prevFailed) * 100 : 0;
    avgQaScoreTrend = prevAvgQaScore > 0 ? ((avgQaScore - prevAvgQaScore) / prevAvgQaScore) * 100 : 0;
  }

  return {
    total,
    completed,
    failed,
    pending,
    processing,
    inQueue,
    successRate,
    failureRate,
    ragGreen,
    ragAmber,
    ragRed,
    avgQaScore,
    avgInputChars,
    avgOutputChars,
    totalTrend,
    successRateTrend,
    failedTrend,
    avgQaScoreTrend,
  };
};

/**
 * Apply dashboard filters to report records (client-side)
 */
export const applyDashboardFilters = (
  records: ReportRecord[],
  filters: ReportDashboardFilters
): ReportRecord[] => {
  let filtered = [...records];

  if (filters.dateFrom) {
    filtered = filtered.filter((r) => r.created_at >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    filtered = filtered.filter((r) => r.created_at <= filters.dateTo!);
  }

  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((r) => r.status === filters.status);
  }

  if (filters.model && filters.model !== 'all') {
    filtered = filtered.filter((r) => r.model === filters.model);
  }

  if (filters.prompt_version && filters.prompt_version !== 'all') {
    filtered = filtered.filter((r) => r.prompt_version === filters.prompt_version);
  }

  if (filters.rag && filters.rag !== 'all') {
    filtered = filtered.filter((r) => r.summary_json?.overall_rating?.rag === filters.rag);
  }

  if (filters.booking_id) {
    const searchTerm = filters.booking_id.toLowerCase();
    filtered = filtered.filter((r) => 
      r.booking_id?.toString().toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
};

export const reportsApiClient = {
  // Get list of reports with filters and pagination
  async getReports(filters: ReportFilters = {}): Promise<ReportListResponse> {
    if (USE_MOCKS) {
      // Mock implementation
      const filtered = filterMockReports(filters);
      const page = filters.page || 1;
      const pageSize = filters.page_size || 25;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = filtered.slice(start, end);
      
      return {
        results: paginated,
        count: filtered.length,
        next: end < filtered.length ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
      };
    }
    
    // Real API call
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/api/reports?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Get single report by ID
  async getReportById(id: number): Promise<ReportRecord> {
    if (USE_MOCKS) {
      const report = mockReportRecords.find(r => r.id === id);
      if (!report) {
        throw new Error(`Report with id ${id} not found`);
      }
      return report;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch report: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Get aggregated statistics
  async getStats(filters: ReportFilters = {}): Promise<ReportStats> {
    if (USE_MOCKS) {
      const filtered = filterMockReports(filters);
      return calculateMockStats(filtered);
    }
    
    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/api/reports/stats?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  // Get unique filter options
  async getFilterOptions(): Promise<{
    models: string[];
    prompt_versions: string[];
    statuses: string[];
  }> {
    if (USE_MOCKS) {
      const models = Array.from(new Set(mockReportRecords.map(r => r.model)));
      const promptVersions = Array.from(new Set(mockReportRecords.map(r => r.prompt_version)));
      const statuses = ['completed', 'failed', 'pending', 'processing'];
      
      return {
        models,
        prompt_versions: promptVersions,
        statuses,
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/reports/filter-options`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch filter options: ${response.statusText}`);
    }
    
    return response.json();
  },
};




