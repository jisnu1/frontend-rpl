import React, { useState } from 'react';

const FILE_TYPE_CONFIG = {
  pdf: { icon: 'description', bg: 'bg-blue-50', color: 'text-blue-600' },
  docx: { icon: 'description', bg: 'bg-blue-50', color: 'text-blue-600' },
  doc: { icon: 'description', bg: 'bg-blue-50', color: 'text-blue-600' },
  pptx: { icon: 'slideshow', bg: 'bg-purple-50', color: 'text-purple-600' },
  ppt: { icon: 'slideshow', bg: 'bg-purple-50', color: 'text-purple-600' },
  jpg: { icon: 'image', bg: 'bg-orange-50', color: 'text-orange-600' },
  jpeg: { icon: 'image', bg: 'bg-orange-50', color: 'text-orange-600' },
  png: { icon: 'image', bg: 'bg-orange-50', color: 'text-orange-600' },
  xlsx: { icon: 'table_chart', bg: 'bg-green-50', color: 'text-green-600' },
  xls: { icon: 'table_chart', bg: 'bg-green-50', color: 'text-green-600' },
  mp4: { icon: 'video_library', bg: 'bg-red-50', color: 'text-red-600' },
  mov: { icon: 'video_library', bg: 'bg-red-50', color: 'text-red-600' },
  zip: { icon: 'image', bg: 'bg-orange-50', color: 'text-orange-600' },
  folder: { icon: 'folder', bg: 'bg-slate-100', color: 'text-slate-600' },
};

function getFileTypeConfig(filename, type) {
  const ext = type || filename.split('.').pop()?.toLowerCase();
  return FILE_TYPE_CONFIG[ext] || { icon: 'insert_drive_file', bg: 'bg-slate-50', color: 'text-slate-500' };
}

function FileRow({ file }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const config = getFileTypeConfig(file.name, file.type);

  return (
    <div className="grid grid-cols-12 items-center px-6 py-4 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group relative">
      {/* File Name */}
      <div className="col-span-6 flex items-center gap-4 min-w-0 pr-4">
        <div className={`w-10 h-10 ${config.bg} ${config.color} rounded-lg flex items-center justify-center shrink-0`}>
          <span className="material-symbols-outlined text-[22px]">{config.icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-body-md font-semibold text-on-surface truncate">{file.name}</p>
          <p className="text-label-sm text-on-surface-variant truncate">{file.folder}</p>
        </div>
      </div>

      {/* Last Modified */}
      <div className="col-span-2 text-body-md text-on-surface-variant font-medium">
        {file.modifiedTime}
      </div>

      {/* Owner */}
      <div className="col-span-2 flex items-center gap-2 min-w-0">
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
        <span className="text-body-md text-on-surface-variant truncate">{file.owner}</span>
      </div>

      {/* File Size & Actions */}
      <div className="col-span-2 flex items-center justify-between pl-4">
        <span className="text-body-md text-on-surface-variant font-medium w-full text-right pr-6">
          {file.size}
        </span>
        <div className="relative shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-container-low transition-all"
          >
            <span className="material-symbols-outlined text-outline text-[20px]">more_vert</span>
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
    </div>
  );
}

export default function RecentFileList({ groupedFiles }) {
  const timelines = ['Today', 'Yesterday', 'Last Week'];

  return (
    <div className="w-full flex flex-col">
      {/* Table Header */}
      <div className="grid grid-cols-12 px-6 py-3 border-b border-outline-variant text-label-sm text-on-surface-variant font-bold uppercase tracking-wider mb-2">
        <div className="col-span-6">File Name</div>
        <div className="col-span-2">Last Modified</div>
        <div className="col-span-2">Owner</div>
        <div className="col-span-2 text-right pr-12">File Size</div>
      </div>

      {timelines.map((group) => {
        const filesInGroup = groupedFiles[group] || [];
        if (filesInGroup.length === 0) return null;

        return (
          <section key={group} className="mb-8">
            <h3 className={`px-6 py-4 text-label-md font-bold flex items-center gap-2 ${group === 'Today' ? 'text-primary' : 'text-on-surface-variant'}`}>
              {group === 'Today' && <span className="w-2 h-2 rounded-full bg-primary"></span>}
              {group}
            </h3>
            <div className="space-y-0.5">
              {filesInGroup.map((file) => (
                <FileRow key={file.id} file={file} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
