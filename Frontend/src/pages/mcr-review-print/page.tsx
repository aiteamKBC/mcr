// MCR file header: Frontend\src\pages\mcr-review-print\page.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.


import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getReviewById } from '../../utils/mcrApiClient';

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
  if (value === 'green') return 'text-emerald-700';
  if (value === 'amber') return 'text-amber-700';
  if (value === 'red') return 'text-rose-700';
  return 'text-slate-700';
};

const ragBadgeClass = (status: string): string => {
  const value = status.toLowerCase();
  if (value === 'green') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (value === 'amber') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (value === 'red') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
};

const triStateBadgeClass = (status: string): string => {
  const value = status.toLowerCase();
  if (value === 'met') return 'bg-emerald-100 text-emerald-800';
  if (value === 'partially met') return 'bg-amber-100 text-amber-800';
  if (value === 'not met') return 'bg-rose-100 text-rose-800';
  return 'bg-slate-100 text-slate-700';
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

const sanitizeFilePart = (value: string): string =>
  value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/ /g, '_');

const PRINT_PAGE_HEIGHT_PX = Math.round((297 - 16) * 3.7795275591);

function SectionBlock({
  title,
  subtitle,
  children,
  className = '',
  keepTogether = false,
  printStartThreshold,
  printBreakCandidate = true,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  keepTogether?: boolean;
  printStartThreshold?: number;
  printBreakCandidate?: boolean;
}) {
  return (
    <section
      className={`report-section ${printBreakCandidate ? 'print-break-candidate' : ''} overflow-hidden rounded-[22px] border border-slate-200 bg-white ${keepTogether ? 'report-section-keep' : ''} ${className}`}
      data-print-start-threshold={printStartThreshold}
    >
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

function DetailCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="report-card rounded-[18px] border border-slate-200 bg-slate-50/90 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-[13px] font-semibold leading-5 text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-[10px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="report-metric rounded-[18px] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50 px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">{label}</p>
      <p className="mt-2 text-[18px] font-bold text-slate-900">{value}</p>
      {caption ? <p className="mt-1 text-[10px] text-slate-500">{caption}</p> : null}
    </div>
  );
}

function applyPrintSectionBreaks() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.print-break-candidate'));
  const sheet = document.querySelector<HTMLElement>('.report-sheet');
  if (!sheet || sections.length === 0) return;

  sections.forEach((section) => section.classList.remove('print-force-break'));

  const sheetTop = sheet.getBoundingClientRect().top + window.scrollY;

  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY - sheetTop;
    const sectionHeight = section.offsetHeight;
    const pageOffset = ((sectionTop % PRINT_PAGE_HEIGHT_PX) + PRINT_PAGE_HEIGHT_PX) % PRINT_PAGE_HEIGHT_PX;
    const remainingOnPage = PRINT_PAGE_HEIGHT_PX - pageOffset;
    const configuredThreshold = Number(section.dataset.printStartThreshold || 0);
    const requiredStartSpace =
      configuredThreshold > 0
        ? configuredThreshold
        : section.classList.contains('report-section-keep')
          ? Math.min(sectionHeight + 12, PRINT_PAGE_HEIGHT_PX)
          : Math.min(Math.max(220, Math.round(sectionHeight * 0.2)), 320);

    if (remainingOnPage < requiredStartSpace && pageOffset > 0) {
      section.classList.add('print-force-break');
    }
  });
}

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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
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
  const qualitativeLabel = textOrDash(summary.overallRating || review.qualitativeRating);
  const totalPlannedMin = meetingSections.reduce((sum, section) => sum + toNumber(section.plannedMin, 0), 0);
  const totalActualMin =
    meetingSections.length > 0
      ? meetingSections.reduce((sum, section) => sum + toNumber(section.actualMin, 0), 0)
      : toNumber(review.totalDurationMin, 0);
  const durationVariance = totalActualMin - totalPlannedMin;
  const overallQaScore =
    toNumber(review.overallQaScore, 0) > 0
      ? toNumber(review.overallQaScore, 0)
      : qaIndicators.length > 0
        ? qaIndicators.reduce((sum, indicator) => sum + toNumber(indicator.score0to5, 0), 0) / qaIndicators.length
        : 0;
  const satisfactionScore = toNumber(review.satisfaction?.score0to5 ?? review.satisfactionScore, 0);
  const safeguardingCompletion =
    safeguardingChecklist.length > 0
      ? Math.round(
          (safeguardingChecklist.filter((item) => item.status.toLowerCase() === 'met').length /
            safeguardingChecklist.length) *
            100
        )
      : 0;
  const lectureDateLabel = formatDateSafe(
    review.meetingStartsAt || review.meetingDayDate || review.date,
    'yyyy-MM-dd'
  );
  useEffect(() => {
    const previousTitle = document.title;
    const filename = [
      'MCR',
      sanitizeFilePart(coachName || 'Coach'),
      'with',
      sanitizeFilePart(learnerName || 'Learner'),
      sanitizeFilePart(lectureDateLabel || 'Date'),
    ]
      .filter(Boolean)
      .join('_');

    document.title = filename;

    return () => {
      document.title = previousTitle;
    };
  }, [coachName, learnerName, lectureDateLabel]);

  useEffect(() => {
    const preparePrintLayout = () => {
      window.requestAnimationFrame(() => {
        applyPrintSectionBreaks();
      });
    };

    preparePrintLayout();
    window.addEventListener('beforeprint', preparePrintLayout);
    window.addEventListener('resize', preparePrintLayout);

    return () => {
      window.removeEventListener('beforeprint', preparePrintLayout);
      window.removeEventListener('resize', preparePrintLayout);
    };
  }, [review]);

  const handlePrint = () => {
    applyPrintSectionBreaks();
    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <style>{`
        @page {
          size: A4;
          margin: 8mm;
        }
        .report-sheet,
        .report-sheet * {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          user-select: text !important;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        @media print {
          body {
            margin: 0;
            background: #fff;
          }
          .report-sheet {
            margin: 0 auto;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
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
          tr {
            page-break-inside: avoid;
          }
          .report-card,
          .report-metric {
            break-inside: avoid-page;
          }
          .report-section-keep {
            display: block;
            width: 100%;
            break-inside: avoid-page;
            page-break-inside: avoid;
            page-break-before: auto;
            page-break-after: auto;
          }
          .report-section-keep > div {
            break-inside: avoid-page;
            page-break-inside: avoid;
          }
          .report-section {
            break-inside: auto;
            page-break-inside: auto;
          }
          .print-force-break {
            page-break-before: always;
            break-before: page;
            margin-top: 20px !important;
          }
          .report-section table {
            margin: 0;
          }
          .page-break {
            page-break-before: auto;
          }
        }
      `}</style>

      <div className="report-sheet mx-auto w-full max-w-[210mm] overflow-hidden rounded-[30px] border border-slate-300 bg-white shadow-sm">
        <div className="px-8 py-7 text-[12px] leading-[1.5] text-slate-900">
          <header className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-5">
              <div className="flex items-center justify-center rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-2">
                <img
                  src="/kent-business-college-logo.png"
                  alt="Kent Business College logo"
                  className="h-20 w-auto object-contain"
                  onError={({ currentTarget }) => {
                    if (!currentTarget.src.includes('kent-business-college-logo.svg')) {
                      currentTarget.src = '/kent-business-college-logo.svg';
                    }
                  }}
                />
              </div>

              <div>
                <h1 className="text-[24px] font-semibold leading-tight text-slate-900">Monthly Coaching Review</h1>
              </div>

              <div className="space-y-2 text-right">
                <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${ragBadgeClass(ragLabel)}`}>
                  RAG: {ragLabel}
                </div>
              </div>
            </div>
          </header>

          <section className="mt-5 grid grid-cols-2 gap-3">
            <DetailCard label="Learner" value={learnerName} />
            <DetailCard label="Coach" value={coachName} />
            <DetailCard label="Programme" value={programmeName} />
            <DetailCard label="Group" value={groupName} />
            <DetailCard label="Meeting Date" value={lectureDateLabel} />
            <DetailCard label="Duration" value={`${toNumber(review.totalDurationMin, 0)} minutes`} hint={qualitativeLabel} />
          </section>

          <section className="mt-5 grid grid-cols-4 gap-3">
            <MetricCard
              label="Overall QA Score"
              value={formatScoreWithPercent(overallQaScore)}
              caption={`${qaIndicators.length} indicators scored`}
            />
            <MetricCard
              label="Learner Satisfaction"
              value={formatScoreWithPercent(satisfactionScore)}
              caption="APTEM learner rating"
            />
            <MetricCard
              label="Safeguarding Completion"
              value={`${safeguardingCompletion}%`}
              caption={`${safeguardingChecklist.length} checklist items`}
            />
            <MetricCard
              label="Duration Variance"
              value={formatVarianceWithPercent(durationVariance, totalPlannedMin)}
              caption={`Planned ${totalPlannedMin} min vs actual ${totalActualMin} min`}
            />
          </section>

          <section
            className="print-break-candidate mt-5 grid grid-cols-2 gap-4"
            data-print-start-threshold="340"
          >
            <SectionBlock
              title="Executive Summary"
              subtitle="High-level narrative of the session"
              keepTogether
              printBreakCandidate={false}
            >
              <p>{textOrDash(summary.executiveSummary, 'No executive summary recorded.')}</p>
            </SectionBlock>

            <SectionBlock
              title="Professional Judgement"
              subtitle="Overall evaluator view"
              keepTogether
              printBreakCandidate={false}
            >
              <p>{textOrDash(summary.professionalJudgement, 'No professional judgement recorded.')}</p>
            </SectionBlock>
          </section>

          <section
            className="print-break-candidate mt-4 grid grid-cols-2 gap-4"
            data-print-start-threshold="320"
          >
            <SectionBlock
              title="Strengths"
              subtitle="Positive themes captured during review"
              keepTogether
              printBreakCandidate={false}
            >
              {summary.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {summary.strengths.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No strengths recorded.</p>
              )}
            </SectionBlock>

            <SectionBlock
              title="Areas for Development"
              subtitle="Actions and improvements to follow up"
              keepTogether
              printBreakCandidate={false}
            >
              {summary.areasForDevelopment.length > 0 ? (
                <ul className="space-y-2">
                  {summary.areasForDevelopment.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No areas for development recorded.</p>
              )}
            </SectionBlock>
          </section>

          <div className="mt-5 space-y-5">
            <SectionBlock
              title="Meeting Structure and Timing"
              subtitle="Planned and actual timing across the session"
              printStartThreshold={260}
            >
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-100 px-3 py-2 text-left">Section</th>
                    <th className="border border-slate-200 bg-slate-100 px-3 py-2 text-center">Planned</th>
                    <th className="border border-slate-200 bg-slate-100 px-3 py-2 text-center">Actual</th>
                    <th className="border border-slate-200 bg-slate-100 px-3 py-2 text-center">Variance</th>
                    <th className="border border-slate-200 bg-slate-100 px-3 py-2 text-left">Notes</th>
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
                          <td className="border border-slate-200 bg-white px-3 py-2">{textOrDash(section.sectionName)}</td>
                          <td className="border border-slate-200 bg-white px-3 py-2 text-center">{planned}</td>
                          <td className="border border-slate-200 bg-white px-3 py-2 text-center">{actual}</td>
                          <td className="border border-slate-200 bg-white px-3 py-2 text-center">
                            {formatVarianceWithPercent(variance, planned)}
                          </td>
                          <td className="border border-slate-200 bg-white px-3 py-2">{textOrDash(section.notes)}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="border border-slate-200 bg-white px-3 py-2" colSpan={5}>
                        No meeting structure data available.
                      </td>
                    </tr>
                  )}
                  {meetingSections.length > 0 ? (
                    <tr>
                      <td className="border border-slate-200 bg-slate-100 px-3 py-2 font-semibold">Total</td>
                      <td className="border border-slate-200 bg-slate-100 px-3 py-2 text-center font-semibold">{totalPlannedMin}</td>
                      <td className="border border-slate-200 bg-slate-100 px-3 py-2 text-center font-semibold">{totalActualMin}</td>
                      <td className="border border-slate-200 bg-slate-100 px-3 py-2 text-center font-semibold">
                        {formatVarianceWithPercent(durationVariance, totalPlannedMin)}
                      </td>
                      <td className="border border-slate-200 bg-slate-100 px-3 py-2">-</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </SectionBlock>

            <SectionBlock
              title="QA Checklist"
              subtitle="Indicator-level quality assessment"
              printStartThreshold={240}
            >
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="w-[34%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Metric</th>
                    <th className="w-[14%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Result</th>
                    <th className="w-[14%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Score</th>
                    <th className="w-[38%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {qaIndicators.length > 0 ? (
                    qaIndicators.map((indicator) => (
                      <tr key={indicator.indicatorKey} className="align-top">
                        <td className="border border-slate-200 bg-white px-3 py-2">
                          {normaliseCriterionName(indicator.indicatorName)}
                        </td>
                        <td className="border border-slate-200 bg-white px-3 py-2">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${triStateBadgeClass(indicator.status)}`}>
                            {indicator.status}
                          </span>
                        </td>
                        <td className="border border-slate-200 bg-white px-3 py-2">{formatScoreWithPercent(indicator.score0to5)}</td>
                        <td className="border border-slate-200 bg-white px-3 py-2">{textOrDash(indicator.comments)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-slate-200 bg-white px-3 py-2" colSpan={4}>
                        QA metrics are not available for this review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </SectionBlock>

            <SectionBlock
              title="Safeguarding Checklist"
              subtitle="Compliance and safety checks captured during the session"
              printStartThreshold={360}
            >
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="w-[34%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Checklist Item</th>
                    <th className="w-[14%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Result</th>
                    <th className="w-[14%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Score</th>
                    <th className="w-[38%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {safeguardingChecklist.length > 0 ? (
                    safeguardingChecklist.map((item) => (
                      <tr key={item.key} className="align-top">
                        <td className="border border-slate-200 bg-white px-3 py-2">{textOrDash(item.label)}</td>
                        <td className="border border-slate-200 bg-white px-3 py-2">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${triStateBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="border border-slate-200 bg-white px-3 py-2">{triStateToPercent(item.status)}%</td>
                        <td className="border border-slate-200 bg-white px-3 py-2">{textOrDash(item.notes)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-slate-200 bg-white px-3 py-2" colSpan={4}>
                        No safeguarding checklist available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </SectionBlock>

            <SectionBlock
              title="Transcript Evidence"
              subtitle="Quoted evidence and references captured from the meeting"
              printStartThreshold={120}
            >
              {transcriptEvidence.length > 0 ? (
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr>
                      <th className="w-[14%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Timestamp</th>
                      <th className="w-[14%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Speaker</th>
                      <th className="w-[52%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Evidence</th>
                      <th className="w-[20%] border border-slate-200 bg-slate-100 px-3 py-2 text-left">Metric</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcriptEvidence.map((item, index) => (
                      <tr key={`${item.timestamp}-${index}`} className="align-top">
                        <td className="border border-slate-200 bg-white px-3 py-2 font-mono">{textOrDash(item.timestamp)}</td>
                        <td className="border border-slate-200 bg-white px-3 py-2">{textOrDash(item.speaker)}</td>
                        <td className="border border-slate-200 bg-white px-3 py-2">{textOrDash(item.text)}</td>
                        <td className="border border-slate-200 bg-white px-3 py-2">{textOrDash(item.metric)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No transcript evidence available.</p>
              )}
            </SectionBlock>
          </div>

          <div className="print-break-candidate" data-print-start-threshold="170">
            <section className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Overall Rating</p>
                  <p className="mt-2 text-[18px] font-semibold text-slate-900">{qualitativeLabel}</p>
                </div>
                <div className="text-right text-[11px] leading-5">
                  <p>
                    RAG: <span className={`font-semibold ${ragTextClass(ragLabel)}`}>{ragLabel}</span>
                  </p>
                  <p>Overall QA Score: {formatScoreWithPercent(overallQaScore)}</p>
                  <p>Satisfaction: {formatScoreWithPercent(satisfactionScore)}</p>
                </div>
              </div>
            </section>

            <footer className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-[11px] text-slate-500">
              <p>Generated by IT Team</p>
              <p>(c) Kent Business College</p>
            </footer>
          </div>
        </div>
      </div>

      <div className="no-print fixed bottom-6 right-6">
        <button
          onClick={handlePrint}
          className="flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-indigo-600"
        >
          <i className="ri-printer-line text-xl"></i>
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
