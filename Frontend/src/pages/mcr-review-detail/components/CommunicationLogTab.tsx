
import { useState } from 'react';
import type { McrReview } from '../../../types/mcr';
import { format } from 'date-fns';
import CommunicationModal from './CommunicationModal';

interface CommunicationLogTabProps {
  review: McrReview;
}

const recipientConfig: Record<string, { icon: string; bg: string; text: string; border: string; label: string }> = {
  Employer: { icon: 'ri-building-line',      bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200',    label: 'Employer' },
  Learner:  { icon: 'ri-user-line',          bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', label: 'Learner' },
  QA:       { icon: 'ri-shield-check-line',  bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   label: 'QA System' },
};

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Sent:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'ri-check-double-line' },
  Pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: 'ri-time-line' },
  Failed:    { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     icon: 'ri-error-warning-line' },
  Delivered: { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',    icon: 'ri-mail-check-line' },
};

export default function CommunicationLogTab({ review }: CommunicationLogTabProps) {
  const [showModal, setShowModal] = useState(false);
  const log = review.communicationLog ?? [];

  const employerCount = log.filter((e) => e.recipientType === 'Employer').length;
  const learnerCount  = log.filter((e) => e.recipientType === 'Learner').length;
  const qaCount       = log.filter((e) => e.recipientType === 'QA').length;
  const sentCount     = log.filter((e) => e.status === 'Sent' || e.status === 'Delivered').length;

  return (
    <div className="space-y-5">

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Entries', value: log.length,      color: 'text-gray-800',    bg: 'bg-gray-50',    border: 'border-gray-100' },
          { label: 'Employer',      value: employerCount,   color: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-100' },
          { label: 'Learner',       value: learnerCount,    color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-100' },
          { label: 'QA System',     value: qaCount,         color: 'text-teal-700',    bg: 'bg-teal-50',    border: 'border-teal-100' },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border ${k.border} ${k.bg} px-4 py-3 text-center`}>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Log List ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <i className="ri-mail-line text-teal-500"></i>
          <h3 className="text-sm font-bold text-gray-900">Communication Timeline</h3>
          <span className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">{sentCount} sent successfully</span>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-xs"></i>
              Add Entry
            </button>
          </span>
        </div>

        {log.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {log.map((entry, idx) => {
              const rc = recipientConfig[entry.recipientType] ?? recipientConfig['QA'];
              const sc = statusConfig[entry.status] ?? statusConfig['Sent'];

              return (
                <div key={idx} className="px-6 py-5 flex items-start gap-4 hover:bg-gray-50/60 transition-colors">
                  {/* Recipient icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${rc.bg} ${rc.border}`}>
                    <i className={`${rc.icon} text-lg ${rc.text}`}></i>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          Communicated to{' '}
                          <span className={`font-bold ${rc.text}`}>{rc.label}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(entry.sentAt), 'dd MMM yyyy, HH:mm')}
                          {' · '}
                          Sent by <span className="font-medium text-gray-600">{entry.sentBy}</span>
                        </p>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap flex-shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
                        <i className={`${sc.icon} text-xs`}></i>
                        {entry.status}
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="mt-2 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                        <p className="text-sm text-gray-700 leading-relaxed">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-mail-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-sm font-semibold text-gray-700">No Communications Yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">No communications have been sent for this review.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-mail-send-line text-xs"></i>
              Send First Communication
            </button>
          </div>
        )}
      </div>

      {/* ── Recipient Breakdown ── */}
      {log.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { ...recipientConfig['Employer'], count: employerCount },
            { ...recipientConfig['Learner'],  count: learnerCount },
            { ...recipientConfig['QA'],       count: qaCount },
          ].map((r) => (
            <div key={r.label} className={`rounded-xl border ${r.border} ${r.bg} px-5 py-4 flex items-center gap-3`}>
              <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <i className={`${r.icon} text-xl ${r.text}`}></i>
              </div>
              <div>
                <p className={`text-2xl font-black ${r.text}`}>{r.count}</p>
                <p className="text-xs text-gray-500 font-medium">{r.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <CommunicationModal
          reviewId={review.id}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
