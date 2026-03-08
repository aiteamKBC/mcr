
import type { McrReview } from '../../../types/mcr';

interface AttachmentsTabProps {
  review: McrReview;
}

const getFileConfig = (type: string) => {
  if (type.includes('powerpoint') || type.includes('presentation'))
    return { icon: 'ri-slideshow-line',   bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', label: 'Presentation' };
  if (type.includes('pdf'))
    return { icon: 'ri-file-pdf-line',    bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100',    label: 'PDF Document' };
  if (type.includes('word') || type.includes('document'))
    return { icon: 'ri-file-word-line',   bg: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-100',    label: 'Word Document' };
  if (type.includes('video'))
    return { icon: 'ri-video-line',       bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', label: 'Video' };
  if (type.includes('audio'))
    return { icon: 'ri-file-music-line',  bg: 'bg-pink-50',   text: 'text-pink-600',   border: 'border-pink-100',   label: 'Audio' };
  return   { icon: 'ri-file-line',        bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-100',   label: 'File' };
};

const formatSize = (bytes?: number) => {
  if (!bytes) return null;
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AttachmentsTab({ review }: AttachmentsTabProps) {
  const attachments = review.attachments ?? [];

  return (
    <div className="space-y-5">

      {/* ── Header KPIs ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Files',    value: attachments.length,                                                    color: 'text-gray-800',    bg: 'bg-gray-50',    border: 'border-gray-100' },
          { label: 'Presentations',  value: attachments.filter(a => a.type.includes('presentation') || a.type.includes('powerpoint')).length, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'PDFs',           value: attachments.filter(a => a.type.includes('pdf')).length,               color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100' },
          { label: 'Documents',      value: attachments.filter(a => a.type.includes('word') || a.type.includes('document')).length, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-100' },
        ].map((k) => (
          <div key={k.label} className={`rounded-xl border ${k.border} ${k.bg} px-4 py-3 text-center`}>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── File List ── */}
      {attachments.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <i className="ri-attachment-line text-teal-500"></i>
            <h3 className="text-sm font-bold text-gray-900">Attached Files</h3>
            <span className="ml-auto text-xs text-gray-400">{attachments.length} {attachments.length === 1 ? 'file' : 'files'}</span>
          </div>

          <div className="divide-y divide-gray-50">
            {attachments.map((file, idx) => {
              const fc = getFileConfig(file.type);
              const size = formatSize(file.size);

              return (
                <div key={idx} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors group">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${fc.bg} ${fc.border}`}>
                    <i className={`${fc.icon} text-lg ${fc.text}`}></i>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-teal-600 transition-colors">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${fc.bg} ${fc.text}`}>{fc.label}</span>
                      {size && <span className="text-xs text-gray-400">{size}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-teal-50 text-gray-600 hover:text-teal-700 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="ri-eye-line text-xs"></i>
                      View
                    </a>
                    <a
                      href={file.url}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="ri-download-line text-xs"></i>
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-attachment-line text-2xl text-gray-400"></i>
          </div>
          <p className="text-sm font-semibold text-gray-700">No Attachments</p>
          <p className="text-xs text-gray-400 mt-1">No files have been attached to this review yet.</p>
        </div>
      )}

      {/* ── Quick Access ── */}
      {attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Quick Access</p>
          <div className="grid grid-cols-3 gap-3">
            {attachments.slice(0, 3).map((file, idx) => {
              const fc = getFileConfig(file.type);
              return (
                <a
                  key={idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-200 rounded-xl transition-all cursor-pointer group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${fc.bg} border ${fc.border}`}>
                    <i className={`${fc.icon} ${fc.text}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-teal-700 transition-colors">{file.name}</p>
                    <p className="text-[10px] text-gray-400">{fc.label}</p>
                  </div>
                  <i className="ri-arrow-right-line text-gray-300 group-hover:text-teal-500 transition-colors text-sm flex-shrink-0"></i>
                </a>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
