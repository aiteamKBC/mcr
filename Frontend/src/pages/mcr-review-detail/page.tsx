
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getReviewById } from '../../utils/mcrApiClient';
import type { McrReview } from '../../types/mcr';
import ReviewHeader from './components/ReviewHeader';
import ReviewActions from './components/ReviewActions';
import MeetingStructureTab from './components/MeetingStructureTab';
import QaIndicatorsTab from './components/QaIndicatorsTab';
import SafeguardingTab from './components/SafeguardingTab';
import KsbEvidenceTab from './components/KsbEvidenceTab';
import OverallSummaryTab from './components/OverallSummaryTab';
import AttachmentsTab from './components/AttachmentsTab';
import CommunicationLogTab from './components/CommunicationLogTab';

type TabType = 'meeting' | 'qa' | 'safeguarding' | 'ksb' | 'summary' | 'attachments' | 'communication';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'meeting',       label: 'Meeting Structure', icon: 'ri-time-line' },
  { key: 'qa',            label: 'QA Indicators',     icon: 'ri-bar-chart-box-line' },
  { key: 'safeguarding',  label: 'Safeguarding',      icon: 'ri-shield-check-line' },
  { key: 'ksb',           label: 'KSB Evidence',      icon: 'ri-file-list-line' },
  { key: 'summary',       label: 'Overall Summary',   icon: 'ri-file-text-line' },
  { key: 'attachments',   label: 'Attachments',       icon: 'ri-attachment-line' },
  { key: 'communication', label: 'Communication Log', icon: 'ri-mail-line' },
];

const getOverviewByTab = (tab: TabType, review: McrReview) => {
  const meetingSections = review.meetingSections ?? [];
  const qaIndicators = review.qaIndicators ?? [];
  const checklist = review.safeguardingChecklist ?? [];
  const evidenceItems = review.evidenceItems ?? [];
  const attachments = review.attachments ?? [];
  const communicationLog = review.communicationLog ?? [];

  const totalPlanned = meetingSections.reduce((sum, s) => sum + s.plannedMin, 0);
  const totalVariance = review.totalDurationMin - totalPlanned;
  const qaAvg =
    qaIndicators.length > 0
      ? qaIndicators.reduce((sum, i) => sum + i.score0to5, 0) / qaIndicators.length
      : 0;
  const metChecklist = checklist.filter((c) => c.status === 'Met').length;
  const completionPct = checklist.length > 0 ? Math.round((metChecklist / checklist.length) * 100) : 0;
  const sentOrDelivered = communicationLog.filter((e) => e.status === 'Sent' || e.status === 'Delivered').length;

  switch (tab) {
    case 'meeting':
      return {
        title: 'How Meeting Structure Is Calculated',
        items: [
          `Planned Duration = sum of all section planned minutes (${totalPlanned} min).`,
          `Actual Duration = review total duration (${review.totalDurationMin} min).`,
          `Total Variance = Actual - Planned (${totalVariance >= 0 ? '+' : ''}${totalVariance} min).`,
        ],
      };
    case 'qa':
      return {
        title: 'How QA Indicators Are Calculated',
        items: [
          `Overall QA Score = average(score0to5) across indicators (${qaAvg.toFixed(2)}/5).`,
          `Status per indicator comes from QA RAG mapping: Met / Partially Met / Not Met.`,
          `Score bars use percent = (score0to5 / 5) x 100.`,
        ],
      };
    case 'safeguarding':
      return {
        title: 'How Safeguarding Is Calculated',
        items: [
          `Completion % = Met checks / Total checks (${metChecklist}/${checklist.length} = ${completionPct}%).`,
          `Overall status is Not Met if any checklist item is Not Met; otherwise Met.`,
          `Learner Satisfaction score is normalized to a 0-5 scale.`,
        ],
      };
    case 'ksb':
      return {
        title: 'How KSB Evidence Is Calculated',
        items: [
          `Verified count = number of evidence items marked verified.`,
          `Pending count = Total evidence items - Verified.`,
          `K / S / B counts are based on whether each item includes the tag in ksbTags.`,
        ],
      };
    case 'summary':
      return {
        title: 'How Overall Summary Is Calculated',
        items: [
          `Overall rating is derived from QA/list rating mapping into summary.overallRating.`,
          `Executive Summary, Strengths, Areas for Development, and Professional Judgement come from mapped review summary fields.`,
          `This tab is qualitative output; it does not apply extra numeric calculations in UI.`,
        ],
      };
    case 'attachments':
      return {
        title: 'How Attachments Are Calculated',
        items: [
          `Total Files = number of items in attachments (${attachments.length}).`,
          `Presentation / PDF / Document counts are grouped using file type text matching.`,
          `Displayed file size is formatted from bytes into B / KB / MB.`,
        ],
      };
    case 'communication':
      return {
        title: 'How Communication Log Is Calculated',
        items: [
          `Total Entries = number of communication log rows (${communicationLog.length}).`,
          `Recipient counters are grouped by recipientType (Employer / Learner / QA).`,
          `Sent successfully = entries with status Sent or Delivered (${sentOrDelivered}).`,
        ],
      };
    default:
      return { title: 'How This Tab Is Calculated', items: [] };
  }
};

export default function McrReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('meeting');

  const { data: review, isLoading, error } = useQuery({
    queryKey: ['review', id],
    queryFn: () => getReviewById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading review details…</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-3xl text-red-500"></i>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Not Found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {error instanceof Error ? error.message : 'This review could not be loaded.'}
          </p>
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/mcr/reviews')}
            className="px-5 py-2.5 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Back to Reviews
          </button>
        </div>
      </div>
    );
  }

  const overview = getOverviewByTab(activeTab, review);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/mcr/reviews')}
              className="flex items-center gap-1.5 text-gray-500 hover:text-teal-600 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-base"></i>
              Reviews
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium">{review.id}</span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.REACT_APP_NAVIGATE('/mcr/dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-dashboard-line"></i>
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">

        {/* ── Safeguarding Alert ── */}
        {review.safeguardingFlagged && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <i className="ri-alarm-warning-fill text-xl text-red-500"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800">Safeguarding Concern Flagged</p>
              <p className="text-xs text-red-600 mt-0.5">
                This review has been flagged. Please review the safeguarding section and ensure appropriate action has been taken.
              </p>
            </div>
          </div>
        )}

        {/* ── Review Header ── */}
        <ReviewHeader review={review} />

        {/* ── Action Bar ── */}
        <ReviewActions reviewId={review.id} />

        {/* ── Tabs + Content ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab Bar */}
          <div className="border-b border-gray-100 overflow-x-auto">
            <div className="flex min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                    activeTab === tab.key
                      ? 'text-teal-600 border-teal-500 bg-teal-50/60'
                      : 'text-gray-500 border-transparent hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <i className={`${tab.icon} text-base`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="mb-5 rounded-xl border border-teal-100 bg-teal-50/50 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-information-line text-teal-600"></i>
                <h4 className="text-sm font-semibold text-teal-900">{overview.title}</h4>
              </div>
              <ul className="space-y-1">
                {overview.items.map((item) => (
                  <li key={item} className="text-xs text-teal-800">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {activeTab === 'meeting'       && <MeetingStructureTab review={review} />}
            {activeTab === 'qa'            && <QaIndicatorsTab review={review} />}
            {activeTab === 'safeguarding'  && <SafeguardingTab review={review} />}
            {activeTab === 'ksb'           && <KsbEvidenceTab review={review} />}
            {activeTab === 'summary'       && <OverallSummaryTab review={review} />}
            {activeTab === 'attachments'   && <AttachmentsTab review={review} />}
            {activeTab === 'communication' && <CommunicationLogTab review={review} />}
          </div>
        </div>

      </div>
    </div>
  );
}
