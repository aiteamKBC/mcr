// MCR file header: Frontend\src\pages\mcr-review-detail\components\AttachmentsTab.tsx
// This file is part of the MCR application source.
// Purpose: Source file for the MCR application.

import type { ChangeEvent } from 'react';
import { useId, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import type { McrReview } from '../../../types/mcr';
import { deleteReviewAttachment, uploadReviewAttachment } from '../../../utils/mcrApiClient';

interface AttachmentsTabProps {
  review: McrReview;
}

const getFileConfig = (type: string) => {
  if (type.includes('powerpoint') || type.includes('presentation')) {
    return {
      icon: 'ri-slideshow-line',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-100',
      label: 'Presentation',
    };
  }
  if (type.includes('pdf')) {
    return {
      icon: 'ri-file-pdf-line',
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
      label: 'PDF Document',
    };
  }
  if (type.includes('word') || type.includes('document')) {
    return {
      icon: 'ri-file-word-line',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
      label: 'Word Document',
    };
  }
  if (type.includes('video')) {
    return {
      icon: 'ri-video-line',
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-100',
      label: 'Video',
    };
  }
  if (type.includes('audio')) {
    return {
      icon: 'ri-file-music-line',
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      border: 'border-pink-100',
      label: 'Audio',
    };
  }
  return {
    icon: 'ri-file-line',
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-100',
    label: 'File',
  };
};

const formatSize = (bytes?: number) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isPreviewableInBrowser = (type: string) => {
  const normalizedType = type.toLowerCase();
  return (
    normalizedType.includes('pdf') ||
    normalizedType.startsWith('image/') ||
    normalizedType.startsWith('text/') ||
    normalizedType.includes('json') ||
    normalizedType.includes('javascript') ||
    normalizedType.includes('svg')
  );
};

export default function AttachmentsTab({ review }: AttachmentsTabProps) {
  const uploadInputId = useId();
  const queryClient = useQueryClient();
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<string | null>(null);
  const attachments = review.attachments ?? [];

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        await uploadReviewAttachment(String(review.id), file, {
          uploadedBy: 'Learner',
          visibleToLearner: true,
        });
      }
      return files.length;
    },
    onSuccess: async (count) => {
      await queryClient.invalidateQueries({ queryKey: ['review', review.id] });
      await Swal.fire({
        icon: 'success',
        title: 'Upload complete',
        text: `${count} file${count === 1 ? '' : 's'} uploaded successfully.`,
        confirmButtonColor: '#4f46e5',
      });
    },
    onError: async (error) => {
      await Swal.fire({
        icon: 'error',
        title: 'Upload failed',
        text: error instanceof Error ? error.message : 'Upload failed. Please try again.',
        confirmButtonColor: '#dc2626',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      setDeletingAttachmentId(attachmentId);
      await deleteReviewAttachment(String(review.id), attachmentId);
      return attachmentId;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['review', review.id] });
      await Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Attachment deleted successfully.',
        confirmButtonColor: '#4f46e5',
      });
    },
    onError: async (error) => {
      await Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: error instanceof Error ? error.message : 'Delete failed. Please try again.',
        confirmButtonColor: '#dc2626',
      });
    },
    onSettled: () => {
      setDeletingAttachmentId(null);
    },
  });

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    await uploadMutation.mutateAsync(files);
    event.target.value = '';
  };

  const handleDeleteAttachment = async (attachmentId?: string, attachmentName?: string) => {
    if (deleteMutation.isPending) return;

    if (!attachmentId) {
      await Swal.fire({
        icon: 'error',
        title: 'Delete unavailable',
        text: 'This attachment does not have a valid identifier.',
        confirmButtonColor: '#dc2626',
      });
      return;
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete attachment?',
      text: `Delete "${attachmentName || 'this attachment'}"? This cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    await deleteMutation.mutateAsync(attachmentId);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.03)] sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Upload learner attachments</p>
          <p className="mt-1 text-xs text-slate-500">
            Upload PDFs, presentations, documents, screenshots, or evidence files so the learner can open them from this review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id={uploadInputId}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <label
            htmlFor={uploadInputId}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              uploadMutation.isPending
                ? 'cursor-wait bg-slate-100 text-slate-400'
                : 'cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_12px_28px_rgba(79,70,229,0.22)]'
            }`}
          >
            <i
              className={`${
                uploadMutation.isPending ? 'ri-loader-4-line animate-spin' : 'ri-upload-2-line'
              } text-base`}
            ></i>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Attachments'}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Files', value: attachments.length, color: 'text-gray-800', bg: 'bg-gray-50', border: 'border-gray-100' },
          {
            label: 'Presentations',
            value: attachments.filter((a) => a.type.includes('presentation') || a.type.includes('powerpoint')).length,
            color: 'text-orange-700',
            bg: 'bg-orange-50',
            border: 'border-orange-100',
          },
          {
            label: 'PDFs',
            value: attachments.filter((a) => a.type.includes('pdf')).length,
            color: 'text-red-700',
            bg: 'bg-red-50',
            border: 'border-red-100',
          },
          {
            label: 'Documents',
            value: attachments.filter((a) => a.type.includes('word') || a.type.includes('document')).length,
            color: 'text-blue-700',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
          },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl border ${kpi.border} ${kpi.bg} px-4 py-3 text-center`}>
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-0.5 text-[10px] font-semibold text-gray-400">{kpi.label}</p>
          </div>
        ))}
      </div>

      {attachments.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
            <i className="ri-attachment-line text-indigo-500"></i>
            <h3 className="text-sm font-bold text-gray-900">Attached Files</h3>
            <span className="ml-auto text-xs text-gray-400">
              {attachments.length} {attachments.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {attachments.map((file, idx) => {
              const fileConfig = getFileConfig(file.type);
              const size = formatSize(file.size);
              const downloadHref = file.downloadUrl || file.url;
              const canPreview = isPreviewableInBrowser(file.type);

              return (
                <div
                  key={file.id || idx}
                  className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/60"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${fileConfig.bg} ${fileConfig.border}`}
                  >
                    <i className={`${fileConfig.icon} text-lg ${fileConfig.text}`}></i>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-indigo-600">
                      {file.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${fileConfig.bg} ${fileConfig.text}`}
                      >
                        {fileConfig.label}
                      </span>
                      {size && <span className="text-xs text-gray-400">{size}</span>}
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 items-center gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    {canPreview ? (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <i className="ri-eye-line text-xs"></i>
                        View
                      </a>
                    ) : null}
                    <a
                      href={downloadHref}
                      download
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <i className="ri-download-line text-xs"></i>
                      Download
                    </a>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        deletingAttachmentId === file.id
                          ? 'cursor-wait bg-rose-100 text-rose-400'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDeleteAttachment(file.id, file.name);
                      }}
                      disabled={!file.id || deleteMutation.isPending}
                    >
                      <i
                        className={`text-xs ${
                          deletingAttachmentId === file.id ? 'ri-loader-4-line animate-spin' : 'ri-delete-bin-line'
                        }`}
                      ></i>
                      {deletingAttachmentId === file.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <i className="ri-attachment-line text-2xl text-gray-400"></i>
          </div>
          <p className="text-sm font-semibold text-gray-700">No Attachments</p>
          <p className="mt-1 text-xs text-gray-400">No files have been attached to this review yet.</p>
          <label
            htmlFor={uploadInputId}
            className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              uploadMutation.isPending
                ? 'cursor-wait bg-slate-100 text-slate-400'
                : 'cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_12px_28px_rgba(79,70,229,0.22)]'
            }`}
          >
            <i
              className={`${
                uploadMutation.isPending ? 'ri-loader-4-line animate-spin' : 'ri-upload-2-line'
              } text-base`}
            ></i>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload First File'}
          </label>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Quick Access</p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {attachments.slice(0, 3).map((file, idx) => {
              const fileConfig = getFileConfig(file.type);
              return (
                <a
                  key={file.id || idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition-all hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${fileConfig.bg} border ${fileConfig.border}`}
                  >
                    <i className={`${fileConfig.icon} ${fileConfig.text}`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-gray-800 transition-colors group-hover:text-indigo-700">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-400">{fileConfig.label}</p>
                  </div>
                  <i className="ri-arrow-right-line flex-shrink-0 text-sm text-gray-300 transition-colors group-hover:text-indigo-500"></i>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
