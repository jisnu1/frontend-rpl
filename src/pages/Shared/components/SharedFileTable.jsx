import React, { useState } from 'react';

const FILE_TYPE_CONFIG = {
  pdf: { icon: 'picture_as_pdf', bg: 'bg-error-container/30', color: 'text-error' },
  docx: { icon: 'description', bg: 'bg-surface-container', color: 'text-tertiary' },
  doc: { icon: 'description', bg: 'bg-surface-container', color: 'text-tertiary' },
  jpg: { icon: 'image', bg: 'bg-surface-container', color: 'text-primary' },
  jpeg: { icon: 'image', bg: 'bg-surface-container', color: 'text-primary' },
  png: { icon: 'image', bg: 'bg-surface-container', color: 'text-primary' },
  xlsx: { icon: 'table_chart', bg: 'bg-surface-container', color: 'text-on-surface-variant' },
  xls: { icon: 'table_chart', bg: 'bg-surface-container', color: 'text-on-surface-variant' },
  mp4: { icon: 'video_library', bg: 'bg-surface-container', color: 'text-primary' },
  mov: { icon: 'video_library', bg: 'bg-surface-container', color: 'text-primary' },
  fig: { icon: 'draw', bg: 'bg-surface-container', color: 'text-primary' },
  zip: { icon: 'folder_zip', bg: 'bg-surface-container', color: 'text-primary' },
};

function getFileTypeConfig(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  return FILE_TYPE_CONFIG[ext] || { icon: 'insert_drive_file', bg: 'bg-surface-container', color: 'text-outline' };
}

// ─── Row (List View) ─────────────────────────────────────────────────────────
function FileRow({ file }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const config = getFileTypeConfig(file.name);

  return (
    <tr className="group hover:bg-surface-container-low/30 transition-colors cursor-pointer relative">
      {/* File Name */}
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
            <span className={`material-symbols-outlined ${config.color}`}>{config.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate max-w-[240px]">{file.name}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{file.shareMethod}</p>
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          {file.ownerAvatar ? (
            <img
              alt={`Avatar of ${file.owner}`}
              className="w-8 h-8 rounded-full ring-1 ring-outline-variant/20 object-cover"
              src={file.ownerAvatar}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
              {file.owner.charAt(0)}
            </div>
          )}
          <span className="text-sm text-on-surface">{file.owner}</span>
        </div>
      </td>

      {/* Shared Date */}
      <td className="px-6 py-5 text-sm text-on-surface-variant">{file.sharedDate}</td>

      {/* File Size */}
      <td className="px-6 py-5 text-sm text-on-surface-variant">{file.size}</td>

      {/* Actions */}
      <td className="px-8 py-5 text-right relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-container transition-all"
        >
          <span className="material-symbols-outlined text-outline text-[20px]">more_vert</span>
        </button>
        {menuOpen && (
          <div className="absolute right-8 top-12 z-20 bg-white rounded-xl shadow-level-2 border border-outline-variant/20 py-1 w-44 text-left">
            {[
              { icon: 'open_in_new', label: 'Open' },
              { icon: 'download', label: 'Download' },
              { icon: 'share', label: 'Share' },
              { icon: 'content_copy', label: 'Copy Link' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-outline">{action.icon}</span>
                {action.label}
              </button>
            ))}
            <div className="border-t border-outline-variant/20 my-1" />
            <button
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">remove_circle</span>
              Remove Access
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── Card (Grid View) ─────────────────────────────────────────────────────────
function FileCard({ file }) {
  const config = getFileTypeConfig(file.name);

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-level-1 p-5 flex flex-col gap-4 hover:shadow-level-2 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
      {/* File Icon & More Button */}
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-[28px] ${config.color}`}>{config.icon}</span>
        </div>
        <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-container-low transition-all">
          <span className="material-symbols-outlined text-[20px] text-outline">more_vert</span>
        </button>
      </div>

      {/* File Info */}
      <div className="min-w-0">
        <p className="text-sm font-bold text-on-surface truncate">{file.name}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{file.shareMethod}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
        <div className="flex items-center gap-2">
          {file.ownerAvatar ? (
            <img
              alt={`Avatar of ${file.owner}`}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-outline-variant/20"
              src={file.ownerAvatar}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
              {file.owner.charAt(0)}
            </div>
          )}
          <span className="text-xs text-on-surface-variant truncate max-w-[80px]">{file.owner}</span>
        </div>
        <span className="text-xs text-outline">{file.size}</span>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          <td className="px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-surface-container animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-40 bg-surface-container rounded animate-pulse" />
                <div className="h-2.5 w-24 bg-surface-container-low rounded animate-pulse" />
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse" />
              <div className="h-3 w-24 bg-surface-container rounded animate-pulse" />
            </div>
          </td>
          <td className="px-6 py-5"><div className="h-3 w-20 bg-surface-container rounded animate-pulse" /></td>
          <td className="px-6 py-5"><div className="h-3 w-12 bg-surface-container rounded animate-pulse" /></td>
          <td className="px-8 py-5" />
        </tr>
      ))}
    </>
  );
}

// ─── Main Table Component ─────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 5;

export default function SharedFileTable({ files, isLoading, viewMode, searchQuery }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);
  const paginatedFiles = files.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const isEmpty = !isLoading && files.length === 0;

  return (
    <div className="bg-white rounded-[2rem] shadow-level-1 border border-outline-variant/10 overflow-hidden">
      {/* ── LIST VIEW ─────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 text-xs text-outline font-bold uppercase tracking-wider">File Name</th>
                <th className="px-6 py-5 text-xs text-outline font-bold uppercase tracking-wider">Owner</th>
                <th className="px-6 py-5 text-xs text-outline font-bold uppercase tracking-wider">Shared Date</th>
                <th className="px-6 py-5 text-xs text-outline font-bold uppercase tracking-wider">File Size</th>
                <th className="px-8 py-5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <TableSkeleton />
              ) : isEmpty ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-outline-variant">search_off</span>
                    {searchQuery ? `No files matching "${searchQuery}"` : 'No shared files yet.'}
                  </td>
                </tr>
              ) : (
                paginatedFiles.map((file) => <FileRow key={file.id} file={file} />)
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── GRID VIEW ─────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-outline-variant/10 p-5 space-y-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-surface-container" />
                  <div className="space-y-2">
                    <div className="h-3 bg-surface-container rounded w-3/4" />
                    <div className="h-2.5 bg-surface-container-low rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="py-16 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2 text-outline-variant">search_off</span>
              {searchQuery ? `No files matching "${searchQuery}"` : 'No shared files yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedFiles.map((file) => <FileCard key={file.id} file={file} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Pagination Footer ─────────────────────── */}
      {!isLoading && files.length > 0 && (
        <div className="px-8 py-4 flex items-center justify-between bg-surface-container-low/20 border-t border-outline-variant/10">
          <p className="text-xs text-on-surface-variant">
            Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, files.length)}–
            {Math.min(page * ITEMS_PER_PAGE, files.length)} of {files.length} items
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-outline-variant text-outline hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-outline-variant text-outline hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
