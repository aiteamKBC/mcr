
import type { McrReview } from '../../../types/mcr';

interface KsbEvidenceTabProps {
  review: McrReview;
}

const ksbColors: Record<string, { bg: string; text: string; border: string }> = {
  K: { bg: 'bg-sky-50',    text: 'text-sky-700',    border: 'border-sky-200' },
  S: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  B: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

export default function KsbEvidenceTab({ review }: KsbEvidenceTabProps) {
  const items = review.evidenceItems ?? [];
  const verified   = items.filter((e) => e.verified).length;
  const pending    = items.length - verified;
  const kCount     = items.filter((e) => e.ksbTags.includes('K')).length;
  const sCount     = items.filter((e) => e.ksbTags.includes('S')).length;
  const bCount     = items.filter((e) => e.ksbTags.includes('B')).length;

  return (
    <div className="space-y-5">

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Items', value: items.length,  color: 'text-gray-800',    bg: 'bg-gray-50',    border: 'border-gray-100' },
          { label: 'Verified',    value: verified,       color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Pending',     value: pending,        color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100' },
          { label: 'Knowledge',   value: kCount,         color: 'text-sky-700',     bg: 'bg-sky-50',     border: 'border-sky-100' },
          { label: 'Skills',      value: sCount,         color: 'text-violet-700',  bg: 'bg-violet-50',  border: 'border-violet-100' },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border ${k.border} ${k.bg} px-4 py-3 text-center`}>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Evidence Table ── */}
      {items.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <i className="ri-file-list-line text-teal-500"></i>
            <h3 className="text-sm font-bold text-gray-900">Evidence Items</h3>
            <span className="ml-auto text-xs text-gray-400">{items.length} items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Evidence Title', 'Description', 'Status', 'KSB Tags', 'EPA Topics', 'Links'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-file-text-line text-teal-600 text-sm"></i>
                        </div>
                        <span className="font-semibold text-gray-800 text-sm leading-snug">{item.title}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-5 py-4 max-w-[220px]">
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {item.verified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold whitespace-nowrap">
                          <i className="ri-checkbox-circle-fill text-xs"></i>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold whitespace-nowrap">
                          <i className="ri-time-line text-xs"></i>
                          Pending
                        </span>
                      )}
                    </td>

                    {/* KSB Tags */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.ksbTags.map((tag, i) => {
                          const c = ksbColors[tag] ?? ksbColors['K'];
                          return (
                            <span key={i} className={`px-2 py-0.5 rounded-md border text-xs font-bold ${c.bg} ${c.text} ${c.border}`}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* EPA Topics */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.epaTopics.map((topic, i) => (
                          <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-md text-xs font-medium whitespace-nowrap">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Links */}
                    <td className="px-5 py-4">
                      {item.links.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {item.links.map((link, i) => (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 bg-gray-100 hover:bg-teal-50 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                              title="View evidence"
                            >
                              <i className="ri-external-link-line text-gray-500 hover:text-teal-600 text-xs"></i>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-file-list-line text-2xl text-gray-400"></i>
          </div>
          <p className="text-sm font-semibold text-gray-700">No Evidence Items</p>
          <p className="text-xs text-gray-400 mt-1">No KSB evidence has been mapped for this review yet.</p>
        </div>
      )}

      {/* ── KSB Summary Cards ── */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Knowledge Items', count: kCount, icon: 'ri-book-open-line',  ...ksbColors['K'] },
            { label: 'Skills Items',    count: sCount, icon: 'ri-tools-line',       ...ksbColors['S'] },
            { label: 'Behaviour Items', count: bCount, icon: 'ri-user-heart-line',  ...ksbColors['B'] },
          ].map((c) => (
            <div key={c.label} className={`rounded-xl border ${c.border} ${c.bg} px-5 py-4 flex items-center gap-3`}>
              <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <i className={`${c.icon} text-xl ${c.text}`}></i>
              </div>
              <div>
                <p className={`text-2xl font-black ${c.text}`}>{c.count}</p>
                <p className="text-xs text-gray-500 font-medium">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
