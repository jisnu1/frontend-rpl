import React, { useState } from 'react';

const FILE_TYPE_CONFIG = {
  pdf: { icon: 'picture_as_pdf', bg: 'bg-red-50', color: 'text-red-500' },
  docx: { icon: 'description', bg: 'bg-blue-50', color: 'text-blue-500' },
  doc: { icon: 'description', bg: 'bg-blue-50', color: 'text-blue-500' },
  pptx: { icon: 'slideshow', bg: 'bg-purple-50', color: 'text-purple-500' },
  ppt: { icon: 'slideshow', bg: 'bg-purple-50', color: 'text-purple-500' },
  jpg: { icon: 'image', bg: 'bg-amber-50', color: 'text-amber-500' },
  jpeg: { icon: 'image', bg: 'bg-amber-50', color: 'text-amber-500' },
  png: { icon: 'image', bg: 'bg-amber-50', color: 'text-amber-500' },
  xlsx: { icon: 'table_chart', bg: 'bg-green-50', color: 'text-green-500' },
  xls: { icon: 'table_chart', bg: 'bg-green-50', color: 'text-green-500' },
  mp4: { icon: 'video_library', bg: 'bg-red-50', color: 'text-red-500' },
  mov: { icon: 'video_library', bg: 'bg-red-50', color: 'text-red-500' },
  zip: { icon: 'folder_zip', bg: 'bg-orange-50', color: 'text-orange-500' },
  folder: { icon: 'folder', bg: 'bg-slate-100', color: 'text-slate-600' },
};

function getFileTypeConfig(filename, type) {
  const ext = type || filename.split('.').pop()?.toLowerCase();
  return FILE_TYPE_CONFIG[ext] || { icon: 'insert_drive_file', bg: 'bg-slate-50', color: 'text-slate-500' };
}

function FileCard({ file }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const config = getFileTypeConfig(file.name, file.type);

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-level-1 p-5 flex flex-col gap-4 hover:shadow-level-2 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative">
      {/* File Icon & Actions */}
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-[28px]">{config.icon}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-[20px] text-outline">more_vert</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 bg-white rounded-xl shadow-level-2 border border-outline-variant/20 py-1 w-44 text-left">
              {[
                { icon: 'open_in_new', label: 'Open' },
                { icon: 'download', label: 'Download' },
                { icon: 'share', label: 'Share' },
                { icon: 'content_copy', label: 'Copy Link' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    console.log(`${action.label} file:`, file.name);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-outline">{action.icon}</span>
                  {action.label}
                </button>
              ))}
              <div className="border-t border-outline-variant/20 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  console.log('Delete file:', file.name);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Info */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{file.name}</p>
        <p className="text-xs text-on-surface-variant mt-0.5 truncate">{file.folder}</p>
        <p className="text-xs text-outline mt-1 font-medium">{file.modifiedTime}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10 mt-auto">
        <div className="flex items-center gap-2 min-w-0">
          {file.ownerAvatar && file.ownerAvatar !== 'ME' ? (
            <img
              alt={`Avatar of ${file.owner}`}
              className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-outline-variant/10"
              src={file.ownerAvatar}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container text-[10px] flex items-center justify-center font-bold shrink-0">
              ME
            </div>
          )}
          <span className="text-xs text-on-surface-variant truncate max-w-[80px]">{file.owner}</span>
        </div>
        <span className="text-xs text-outline font-semibold">{file.size}</span>
      </div>
    </div>
  );
}

export default function RecentFileGrid({ groupedFiles }) {
  const timelines = ['Today', 'Yesterday', 'Last Week'];

  return (
    <div className="w-full flex flex-col gap-8">
      {timelines.map((group) => {
        const filesInGroup = groupedFiles[group] || [];
        if (filesInGroup.length === 0) return null;

        return (
          <section key={group} className="w-full">
            <h3 className="text-label-md font-bold text-primary flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${group === 'Today' ? 'bg-primary' : 'bg-outline-variant'}`}></span>
              {group}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filesInGroup.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
