import React from 'react';
import { 
  Folder, 
  File, 
  ShieldAlert, 
  ChevronRight, 
  Loader2, 
  Sliders,
  HardDrive
} from 'lucide-react';
import { FolderResponse } from '../../../api/folders';
import { FileResponse } from '../../../api/files';

interface TabConfig {
  id: string;
  name: string;
  provider: 'STORAGE_NODE' | 'GOOGLE_DRIVE';
  accountId: number | null;
  email?: string;
}

interface MigrationConfig {
  maxFileSizeBytes: number;
  maxDailyLimit: number;
  todayTasksCount: number;
}

interface MigrationFileListProps {
  isLoading: boolean;
  isLargeScreen: boolean;
  filteredTabFolders: FolderResponse[];
  filteredTabFiles: FileResponse[];
  selectedFolders: Record<string, FolderResponse & { provider: string; externalAccountId?: number | null }>;
  selectedFiles: Record<string, FileResponse>;
  config: MigrationConfig;
  currentTabConfig: TabConfig;
  handleToggleSelectAll: () => void;
  handleToggleFolder: (folder: FolderResponse) => void;
  handleToggleFile: (file: FileResponse) => void;
  handleFolderDoubleClick: (folder: FolderResponse) => void;
  formatSize: (bytes: number) => string;
}

export default function MigrationFileList({
  isLoading,
  isLargeScreen,
  filteredTabFolders,
  filteredTabFiles,
  selectedFolders,
  selectedFiles,
  config,
  currentTabConfig,
  handleToggleSelectAll,
  handleToggleFolder,
  handleToggleFile,
  handleFolderDoubleClick,
  formatSize
}: MigrationFileListProps) {
  const isAllChecked = (filteredTabFiles.length > 0 || filteredTabFolders.length > 0) && 
    filteredTabFiles.every(file => selectedFiles[file.id]) && 
    filteredTabFolders.every(folder => selectedFolders[folder.id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-slate-400 font-sans">Memuat berkas...</p>
      </div>
    );
  }

  const isEmpty = filteredTabFiles.length === 0 && filteredTabFolders.length === 0;
  if (isEmpty) {
    return (
      <div className="py-24 px-6 w-full mx-auto text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-3 select-none">
        <Sliders className="w-12 h-12 text-slate-200" />
        <span className="max-w-[220px] leading-relaxed">Belum ada berkas atau folder di dalam penyimpanan ini.</span>
      </div>
    );
  }

  if (isLargeScreen) {
    return (
      <div className="overflow-x-auto select-none">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-black tracking-wider uppercase">
              <th className="py-3 px-5 w-10 text-center">
                <input 
                  type="checkbox" 
                  checked={isAllChecked} 
                  onChange={handleToggleSelectAll} 
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer" 
                />
              </th>
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4">Ukuran</th>
              <th className="py-3 px-4">Provider</th>
              <th className="py-3 px-4">Tanggal Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {/* Folders */}
            {filteredTabFolders.map(folder => {
              const isChecked = !!selectedFolders[folder.id];
              return (
                <tr 
                  key={folder.id} 
                  className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isChecked ? 'bg-primary/5' : ''}`} 
                  onClick={() => handleToggleFolder(folder)}
                  onDoubleClick={() => handleFolderDoubleClick(folder)}
                >
                  <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isChecked} 
                      onChange={() => handleToggleFolder(folder)} 
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer" 
                    />
                  </td>
                  <td className="py-3.5 px-4 font-bold max-w-sm">
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4.5 h-4.5 text-primary shrink-0" />
                      <span className="truncate" title={folder.name}>{folder.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">-</td>
                  <td className="py-3.5 px-4 text-on-surface-variant uppercase font-black">{currentTabConfig.provider}</td>
                  <td className="py-3.5 px-4 text-slate-400">{folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              );
            })}
            {/* Files */}
            {filteredTabFiles.map(file => {
              const isChecked = !!selectedFiles[file.id];
              const isTooLarge = config.maxFileSizeBytes !== -1 && file.size > config.maxFileSizeBytes;
              return (
                <tr key={file.id} className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isChecked ? 'bg-primary/5' : ''}`} onClick={() => handleToggleFile(file)}>
                  <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={isChecked} onChange={() => handleToggleFile(file)} className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer" />
                  </td>
                  <td className="py-3.5 px-4 font-bold max-w-sm">
                    <div className="flex items-center gap-2.5">
                      <File className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={file.originalFileName}>{file.originalFileName}</span>
                      {isTooLarge && (
                        <span className="text-[8px] font-black bg-error-container text-error px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          Premium limit exceeded ({formatSize(config.maxFileSizeBytes)})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatSize(file.size)}</td>
                  <td className="py-3.5 px-4 text-on-surface-variant uppercase font-black">{file.provider}</td>
                  <td className="py-3.5 px-4 text-slate-400">{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="space-y-3">
      {/* Folder cards */}
      {filteredTabFolders.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Folder</h4>
          <div className="grid grid-cols-1 gap-2">
            {filteredTabFolders.map(folder => {
              const isChecked = !!selectedFolders[folder.id];
              return (
                <div
                  key={folder.id}
                  onDoubleClick={() => handleFolderDoubleClick(folder)}
                  onClick={() => handleToggleFolder(folder)}
                  className={`w-full min-w-0 relative rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden border ${
                    isChecked
                      ? 'bg-primary/5 border-primary shadow-md shadow-primary/10'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between p-3.5 min-w-0 w-full">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl ${isChecked ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}>
                        <Folder className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 break-all break-words line-clamp-2" title={folder.name}>
                          {folder.name}
                        </p>
                        <p className="text-[9px] text-slate-450 font-semibold mt-0.5">
                          Double click untuk membuka folder
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      onClick={e => e.stopPropagation()}
                      className="w-4 h-4 accent-primary rounded-lg cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File cards */}
      {filteredTabFiles.length > 0 && (
        <div className="space-y-2">
          {filteredTabFolders.length > 0 && <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Berkas</h4>}
          <div className="space-y-2">
            {filteredTabFiles.map(file => {
              const isChecked = !!selectedFiles[file.id];
              const isTooLarge = config.maxFileSizeBytes !== -1 && file.size > config.maxFileSizeBytes;
              const isGDriveFile = file.provider === 'GOOGLE_DRIVE';
              return (
                <div
                  key={file.id}
                  onClick={() => handleToggleFile(file)}
                  className={`w-full min-w-0 relative rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
                    isChecked
                      ? isGDriveFile
                        ? 'bg-sky-50 border-2 border-sky-400 shadow-md shadow-sky-100'
                        : 'bg-primary/5 border-2 border-primary shadow-md shadow-primary/10'
                      : 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                  }`}
                >
                  {isChecked && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isGDriveFile ? 'bg-sky-500' : 'bg-primary'}`} />
                  )}
                  <div className="flex items-center gap-3 p-3.5 pl-4 w-full min-w-0">
                    <div onClick={e => e.stopPropagation()} className="shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
                          isChecked
                            ? isGDriveFile ? 'bg-sky-500 border-sky-500' : 'bg-primary border-primary'
                            : 'border-slate-300 bg-white'
                        }`}
                        onClick={() => handleToggleFile(file)}
                      >
                        {isChecked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      isGDriveFile ? 'bg-sky-100' : 'bg-blue-50'
                    }`}>
                      {isGDriveFile
                        ? <HardDrive className="w-5 h-5 text-sky-500" />
                        : <File className="w-5 h-5 text-primary" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 break-all break-words line-clamp-2 leading-snug">{file.originalFileName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isGDriveFile ? 'bg-sky-100 text-sky-600' : 'bg-primary/10 text-primary'
                        }`}>
                          {isGDriveFile ? 'Google Drive' : 'Storage Node'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{formatSize(file.size)}</span>
                        {file.createdAt && (
                          <span className="text-[10px] text-slate-400">
                            {new Date(file.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {isTooLarge && (
                        <div className="mt-1.5 inline-flex items-center gap-1 bg-red-50 border border-red-100 text-red-500 rounded-full px-2 py-0.5">
                          <ShieldAlert className="w-3 h-3" />
                          <span className="text-[9px] font-black">Melebihi batas ({formatSize(config.maxFileSizeBytes)})</span>
                        </div>
                      )}
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${isChecked ? (isGDriveFile ? 'text-sky-400' : 'text-primary') : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
