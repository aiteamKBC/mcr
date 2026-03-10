
import type { McrReview } from '../../../types/mcr';

interface OverallSummaryTabProps {
  review: McrReview;
}

const ratingConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Outstanding:            { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', icon: 'ri-award-fill' },
  Strong:                 { bg: 'bg-teal-50',     text: 'text-teal-700',    border: 'border-teal-200',    icon: 'ri-thumb-up-fill' },
  'Requires Improvement': { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   icon: 'ri-error-warning-fill' },
  'Cause for Concern':    { bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',     icon: 'ri-alarm-warning-fill' },
};

export default function OverallSummaryTab({ review }: OverallSummaryTabProps) {
  const summary = review.overallSummary;

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i className="ri-file-text-line text-2xl text-gray-400"></i>
        </div>
        <p className="text-sm font-semibold text-gray-700">No Summary Available</p>
        <p className="text-xs text-gray-400 mt-1">Overall summary has not been completed for this review yet.</p>
      </div>
    );
  }

  const rc = ratingConfig[summary.overallRating] ?? {
    bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: 'ri-file-text-line',
  };

  return (
    <div className="space-y-5">

      {/* ── Rating Banner ── */}
      <div className={`flex items-center justify-between rounded-xl border px-6 py-4 ${rc.bg} ${rc.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-lg bg-white/70 ${rc.text}`}>
            <i className={`${rc.icon} text-xl`}></i>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Overall QA Rating</p>
            <p className={`text-lg font-bold ${rc.text}`}>{summary.overallRating}</p>
          </div>
        </div>
        <div className={`text-xs font-medium ${rc.text} opacity-70 max-w-xs text-right leading-relaxed`}>
          {summary.overallRating === 'Outstanding'            && 'Absolutely top-drawer — couldn\'t have asked for better.'}
          {summary.overallRating === 'Strong'                 && 'Solid work all round — ticking the right boxes nicely.'}
          {summary.overallRating === 'Requires Improvement'   && 'Room for tightening up — nothing that can\'t be brought up to scratch.'}
          {summary.overallRating === 'Cause for Concern'      && 'Needs sorting out rather urgently — can\'t afford to let this slide.'}
        </div>
      </div>

      {/* ── Executive Summary ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-teal-50 rounded-lg">
            <i className="ri-file-list-3-line text-teal-600"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Executive Summary</h3>
            <p className="text-xs text-gray-400">Clear, concise overview of meeting quality</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border border-gray-100">
          {summary.executiveSummary}
        </p>
      </div>

      {/* ── Strengths + Areas ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg">
              <i className="ri-thumb-up-line text-emerald-600"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Strengths</h3>
              <p className="text-xs text-gray-400">What went swimmingly</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {summary.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center bg-emerald-100 rounded-full flex-shrink-0 mt-0.5">
                  <i className="ri-check-line text-xs text-emerald-600"></i>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Development */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg">
              <i className="ri-lightbulb-line text-amber-600"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Areas for Development</h3>
              <p className="text-xs text-gray-400">Nudges in the right direction</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {summary.areasForDevelopment.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 flex items-center justify-center bg-amber-100 rounded-full flex-shrink-0 mt-0.5">
                  <i className="ri-arrow-right-line text-xs text-amber-600"></i>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{a}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Professional Judgement ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg">
            <i className="ri-user-star-line text-slate-600"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Professional Judgement</h3>
            <p className="text-xs text-gray-400">Polished, balanced verdict</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-4 border border-gray-100">
          {summary.professionalJudgement}
        </p>
      </div>

    </div>
  );
}
