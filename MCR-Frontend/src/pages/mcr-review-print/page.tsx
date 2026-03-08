import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getReviewById } from '../../utils/mcrApiClient';
import { format } from 'date-fns';

const textOrDash = (value: unknown, fallback = '-'): string => {
  const raw = String(value ?? '').trim();
  return raw ? raw : fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDateSafe = (value: unknown, pattern: string): string => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, pattern);
};

const normaliseCriterionName = (value: unknown): string => {
  return textOrDash(value)
    .replace(/^qa\s*(->|:|-)?\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const ragTextClass = (status: string): string => {
  const value = status.toLowerCase();
  if (value === 'green') return 'text-green-700';
  if (value === 'amber') return 'text-amber-700';
  if (value === 'red') return 'text-red-700';
  return 'text-zinc-700';
};

const triStateBadgeClass = (status: string): string => {
  const value = status.toLowerCase();
  if (value === 'met') return 'bg-green-100 text-green-800';
  if (value === 'partially met') return 'bg-amber-100 text-amber-800';
  if (value === 'not met') return 'bg-red-100 text-red-800';
  return 'bg-zinc-100 text-zinc-700';
};

const scoreToPercent = (scoreOutOfFive: number): number => {
  const clamped = Math.max(0, Math.min(5, scoreOutOfFive));
  return Math.round((clamped / 5) * 100);
};

const formatScoreWithPercent = (value: unknown): string => {
  const score = toNumber(value, 0);
  return `${score.toFixed(1)}/5 (${scoreToPercent(score)}%)`;
};

const triStateToPercent = (status: string): number => {
  const value = status.toLowerCase();
  if (value === 'met') return 100;
  if (value === 'partially met') return 50;
  if (value === 'not met') return 0;
  return 0;
};

const formatVarianceWithPercent = (variance: number, planned: number): string => {
  const varianceLabel = `${variance > 0 ? '+' : ''}${variance}`;
  if (planned <= 0) return `${varianceLabel} (N/A)`;

  const variancePercent = (variance / planned) * 100;
  const percentLabel = `${variancePercent > 0 ? '+' : ''}${variancePercent.toFixed(1)}%`;
  return `${varianceLabel} (${percentLabel})`;
};

export default function McrReviewPrint() {
  const { id } = useParams<{ id: string }>();

  const { data: review, isLoading } = useQuery({
    queryKey: ['review', id],
    queryFn: () => getReviewById(id!),
    enabled: !!id,
  });

  if (isLoading || !review) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading review for print...</p>
        </div>
      </div>
    );
  }

  const learnerName = textOrDash((review as any).learner?.name ?? review.learner);
  const coachName = textOrDash((review as any).coach?.name ?? review.coach);
  const programmeName = textOrDash((review as any).programme?.name ?? review.programme, 'Not evidenced in transcript');
  const groupName = textOrDash((review as any).group?.name ?? review.group, '-');

  const qaIndicators = review.qaIndicators ?? [];
  const meetingSections = review.meetingSections ?? [];
  const safeguardingChecklist = review.safeguardingChecklist ?? [];
  const transcriptEvidence = review.transcriptEvidence ?? [];

  const summary = review.overallSummary ?? {
    executiveSummary: '',
    strengths: [],
    areasForDevelopment: [],
    professionalJudgement: '',
  };

  const ragLabel = textOrDash(review.ragStatus);
  const totalPlannedMin = meetingSections.reduce((sum, section) => sum + toNumber(section.plannedMin, 0), 0);
  const totalActualMin =
    meetingSections.length > 0
      ? meetingSections.reduce((sum, section) => sum + toNumber(section.actualMin, 0), 0)
      : toNumber(review.totalDurationMin, 0);
  const overallQaScore =
    toNumber(review.overallQaScore, 0) > 0
      ? toNumber(review.overallQaScore, 0)
      : qaIndicators.length > 0
      ? qaIndicators.reduce((sum, indicator) => sum + toNumber(indicator.score0to5, 0), 0) / qaIndicators.length
      : 0;
  const satisfactionScore = toNumber(review.satisfaction?.score0to5 ?? review.satisfactionScore, 0);
  const printedAtLabel = format(new Date(), 'yyyy-MM-dd HH:mm');

  return (
    <div className="min-h-screen bg-zinc-100 py-8 print:bg-white print:py-0">
      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }
        .report-sheet,
        .report-sheet * {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }
        @media print {
          body {
            margin: 0;
            background: #fff;
          }
          .report-sheet {
            margin: 0 auto;
            border: 0;
            box-shadow: none;
            width: 100%;
            max-width: none;
          }
          .no-print {
            display: none !important;
          }
          /* Hide browser extensions / floating chat widgets in PDF output */
          body > :not(#root),
          iframe,
          [id*='chat'],
          [class*='chat'],
          [id*='widget'],
          [class*='widget'],
          [id*='assistant'],
          [class*='assistant'] {
            display: none !important;
            visibility: hidden !important;
          }
          tr, td, th {
            page-break-inside: avoid;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="report-sheet mx-auto w-full max-w-[210mm] border border-zinc-300 bg-white shadow-sm print:shadow-none">
        <div className="px-8 py-7 text-[12px] leading-[1.45] text-zinc-900">
          <header className="mb-4 border border-zinc-200 bg-zinc-100 px-3 py-2">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <div className="flex items-center gap-2">
                <img
                  src="/kent-business-college-logo.png"
                  alt="Kent Business College logo"
                  className="h-24 w-auto object-contain"
                  onError={({ currentTarget }) => {
                    if (!currentTarget.src.includes('kent-business-college-logo.svg')) {
                      currentTarget.src = '/kent-business-college-logo.svg';
                    }
                  }}
                />
              </div>
              <h1 className="text-[24px] font-semibold text-zinc-900">Monthly Coaching Review (MCR)</h1>
              <p className="text-[11px]">
                RAG: <span className={`font-semibold ${ragTextClass(ragLabel)}`}>{ragLabel}</span>
              </p>
            </div>
          </header>

          <section className="mb-5">
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                <tr>
                  <td className="w-[22%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-zinc-700">Learner</td>
                  <td className="w-[78%] border border-zinc-200 bg-zinc-50 px-2 py-1">{learnerName}</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-zinc-700">Coach</td>
                  <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{coachName}</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-zinc-700">Duration</td>
                  <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{toNumber(review.totalDurationMin, 0)} minutes</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-zinc-700">Programme</td>
                  <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{programmeName}</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-zinc-700">Group</td>
                  <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{groupName}</td>
                </tr>
                <tr>
                  <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-zinc-700">Printed At (PDF)</td>
                  <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{printedAtLabel}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-4">
            <h2 className="mb-1 text-[15px] font-semibold">Executive Summary</h2>
            <p>{textOrDash(summary.executiveSummary, 'No executive summary recorded.')}</p>
          </section>

          <section className="mb-4">
            <h2 className="mb-1 text-[15px] font-semibold">Strengths</h2>
            {summary.strengths.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {summary.strengths.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No strengths recorded.</p>
            )}
          </section>

          <section className="mb-4">
            <h2 className="mb-1 text-[15px] font-semibold">Areas for Development</h2>
            {summary.areasForDevelopment.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {summary.areasForDevelopment.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No areas for development recorded.</p>
            )}
          </section>

          <section className="mb-4">
            <h2 className="mb-1 text-[15px] font-semibold">Professional Judgement</h2>
            <p>{textOrDash(summary.professionalJudgement, 'No professional judgement recorded.')}</p>
          </section>

          <section className="mb-5">
            <h2 className="mb-1 text-[15px] font-semibold">Meeting Structure & Timing</h2>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Section</th>
                  <th className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-center">Planned</th>
                  <th className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-center">Actual</th>
                  <th className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-center">Variance (Min / %)</th>
                  <th className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {meetingSections.length > 0 ? (
                  meetingSections.map((section) => {
                    const planned = toNumber(section.plannedMin, 0);
                    const actual = toNumber(section.actualMin, 0);
                    const variance = actual - planned;
                    return (
                      <tr key={section.sectionKey}>
                        <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{textOrDash(section.sectionName)}</td>
                        <td className="border border-zinc-200 bg-zinc-50 px-2 py-1 text-center">{planned}</td>
                        <td className="border border-zinc-200 bg-zinc-50 px-2 py-1 text-center">{actual}</td>
                        <td className="border border-zinc-200 bg-zinc-50 px-2 py-1 text-center">{formatVarianceWithPercent(variance, planned)}</td>
                        <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{textOrDash(section.notes)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="border border-zinc-200 bg-zinc-50 px-2 py-1" colSpan={5}>No meeting structure data available.</td>
                  </tr>
                )}
                {meetingSections.length > 0 ? (
                  <tr>
                    <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 font-semibold">Total</td>
                    <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-center font-semibold">{totalPlannedMin}</td>
                    <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-center font-semibold">{totalActualMin}</td>
                    <td className="border border-zinc-200 bg-zinc-100 px-2 py-1 text-center font-semibold">{formatVarianceWithPercent(totalActualMin - totalPlannedMin, totalPlannedMin)}</td>
                    <td className="border border-zinc-200 bg-zinc-100 px-2 py-1">-</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>

          <section className="mb-5">
            <h2 className="mb-1 text-[15px] font-semibold">QA Checklist</h2>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="w-[34%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Metric</th>
                  <th className="w-[14%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Result</th>
                  <th className="w-[10%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Score (%)</th>
                  <th className="w-[42%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {qaIndicators.length > 0 ? (
                  qaIndicators.map((indicator) => (
                    <tr key={indicator.indicatorKey} className="align-top">
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{normaliseCriterionName(indicator.indicatorName)}</td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${triStateBadgeClass(indicator.status)}`}>
                          {indicator.status}
                        </span>
                      </td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{formatScoreWithPercent(indicator.score0to5)}</td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{textOrDash(indicator.comments)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-zinc-200 bg-zinc-50 px-2 py-1" colSpan={4}>QA metrics are not available for this review.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="mb-5">
            <h2 className="mb-1 text-[15px] font-semibold">Safeguarding Checklist</h2>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="w-[34%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Checklist Item</th>
                  <th className="w-[14%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Result</th>
                  <th className="w-[10%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Score (%)</th>
                  <th className="w-[42%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {safeguardingChecklist.length > 0 ? (
                  safeguardingChecklist.map((item) => (
                    <tr key={item.key} className="align-top">
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{textOrDash(item.label)}</td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${triStateBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{triStateToPercent(item.status)}%</td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{textOrDash(item.notes)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-zinc-200 bg-zinc-50 px-2 py-1" colSpan={4}>No safeguarding checklist available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <section className="mb-5">
            <h2 className="mb-1 text-[15px] font-semibold">Transcript Evidence</h2>
            {transcriptEvidence.length > 0 ? (
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="w-[14%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Timestamp</th>
                    <th className="w-[14%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Speaker</th>
                    <th className="w-[52%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Evidence</th>
                    <th className="w-[20%] border border-zinc-200 bg-zinc-100 px-2 py-1 text-left">Metric</th>
                  </tr>
                </thead>
                <tbody>
                  {transcriptEvidence.map((item, index) => (
                    <tr key={`${item.timestamp}-${index}`} className="align-top">
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono">{textOrDash(item.timestamp)}</td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{textOrDash(item.speaker)}</td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{textOrDash(item.text)}</td>
                      <td className="border border-zinc-200 bg-zinc-50 px-2 py-1">{textOrDash(item.metric)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No transcript evidence available.</p>
            )}
          </section>

          <section className="mb-2">
            <h2 className="mb-1 text-[15px] font-semibold">Overall Rating</h2>
            <p>
              RAG: <span className={`font-semibold ${ragTextClass(ragLabel)}`}>{ragLabel}</span>
            </p>
            <p>Qualitative: {textOrDash(review.qualitativeRating)}</p>
            <p>Overall QA Score: {formatScoreWithPercent(overallQaScore)}</p>
            <p>Satisfaction: {formatScoreWithPercent(satisfactionScore)}</p>
          </section>

          <footer className="mt-6 text-[11px] text-zinc-500">
            <p>Generated by IT Team</p>
            <p>(c) Kent Business College</p>
          </footer>
        </div>
      </div>

      <div className="no-print fixed bottom-6 right-6">
        <button
          onClick={() => window.print()}
          className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-teal-600"
        >
          <i className="ri-printer-line text-xl"></i>
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}








