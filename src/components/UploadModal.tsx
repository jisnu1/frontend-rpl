import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Cloud, HardDrive } from 'lucide-react';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { fetchExternalAccounts, fetchGoogleDriveStorage, getGoogleAuthUrl, connectExternalAccount, GoogleDriveStorageDto } from '../api/externalAccounts';
import { useActivity } from '../context/ActivityContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
  folderId?: string;
  gDriveFolderId?: string;
}

interface ProviderOption {
  type: 'STORAGE_NODE' | 'GOOGLE_DRIVE';
  label: string;
  sublabel: string;
  externalAccountId?: number;
  storageInfo?: GoogleDriveStorageDto | null;
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess, folderId, gDriveFolderId }: UploadModalProps) {
  const { uploadFile } = useActivity();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number>(0); // index into providers array
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Load providers when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setSelectedProvider(0);

      const loadProviders = async () => {
        setIsLoadingProviders(true);
        const providerList: ProviderOption[] = [
          {
            type: 'STORAGE_NODE',
            label: 'Horizon Local Storage',
            sublabel: 'Simpan di Server VPS Lokal',
          },
        ];

        try {
          const accs = await fetchExternalAccounts();
          const googleAccs = accs.filter(a => a.provider.toUpperCase().startsWith('GOOGLE'));

          // Fetch storage info for each Google account
          for (const acc of googleAccs) {
            let storageInfo: GoogleDriveStorageDto | null = null;
            try {
              storageInfo = await fetchGoogleDriveStorage(acc.id);
            } catch (err) {
              console.warn(`Failed to fetch storage for ${acc.email}`, err);
            }

            providerList.push({
              type: 'GOOGLE_DRIVE',
              label: `Google Drive`,
              sublabel: acc.email,
              externalAccountId: acc.id,
              storageInfo,
            });
          }
        } catch (err) {
          console.warn('Failed to load Google accounts', err);
        }

        setProviders(providerList);
        setIsLoadingProviders(false);
      };

      loadProviders();
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const provider = providers[selectedProvider];
    if (!provider) return;

    const targetFolder = provider.type === 'GOOGLE_DRIVE' ? gDriveFolderId : folderId;

    // Trigger asynchronous background upload
    uploadFile(selectedFile, provider, onUploadSuccess, targetFolder);
    
    // Close the upload modal immediately
    onClose();
  };

  const dragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const fileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New File" icon={UploadCloud}>
      <div className="space-y-4">
        {/* Storage Provider Selection — Radio Cards */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilih Tujuan Penyimpanan</label>

          {isLoadingProviders ? (
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex-1 h-20 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {providers.map((p, idx) => {
                const isSelected = selectedProvider === idx;
                const isGDrive = p.type === 'GOOGLE_DRIVE';
                const Icon = isGDrive ? HardDrive : Cloud;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedProvider(idx)}
                    className={`
                      flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200
                      ${isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/55'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected
                      ? (isGDrive ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary')
                      : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>
                        {p.label}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                        {p.sublabel}
                      </p>
                      {isGDrive && p.storageInfo && p.storageInfo.totalBytes > 0 && (
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">
                          {formatSize(p.storageInfo.usedBytes)} / {formatSize(p.storageInfo.totalBytes)}
                        </p>
                      )}
                    </div>
                    {/* Radio indicator */}
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected ? 'border-primary' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                );
              })}

              {/* If no Google Drive is connected, show a helper button to connect */}
              {!providers.some(p => p.type === 'GOOGLE_DRIVE') && (
                <button
                  key="connect-gdrive"
                  type="button"
                  onClick={async () => {
                    if (!window.google) {
                      alert('Google SDK belum siap. Silakan coba sesaat lagi.');
                      return;
                    }
                    try {
                      const clientId = await getGoogleAuthUrl();
                      if (!clientId) {
                        throw new Error('Google Client ID tidak ditemukan di backend.');
                      }

                      const client = window.google.accounts.oauth2.initCodeClient({
                        client_id: clientId,
                        scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
                        ux_mode: 'popup',
                        callback: async (response: any) => {
                          if (response.error) {
                            alert(`Otorisasi gagal: ${response.error}`);
                            return;
                          }
                          if (response.code) {
                            try {
                              setIsLoadingProviders(true);
                              await connectExternalAccount(response.code);
                              if (onUploadSuccess) onUploadSuccess();
                              onClose();
                            } catch (err: any) {
                              console.error(err);
                              alert(err.response?.data?.message || 'Gagal menyimpan akun Google Drive.');
                            } finally {
                              setIsLoadingProviders(false);
                            }
                          }
                        },
                      });
                      client.requestCode();
                    } catch (err) {
                      console.error('Failed to get Google auth URL', err);
                    }
                  }}
                  className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-left transition-all duration-200 cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-primary flex items-center gap-1">
                      + Hubungkan Google Drive
                    </p>
                    <p className="text-[10px] text-primary/70 font-semibold truncate mt-0.5">
                      Belum ada akun terhubung
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dropzone */}
        <div 
          onDragOver={dragOver}
          onDrop={fileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-primary/60 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 group flex flex-col items-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="w-10 h-10 text-slate-450 mb-2 group-hover:text-primary transition-colors" />
          
          {selectedFile ? (
            <div>
              <p className="text-xs font-bold text-slate-850 break-all">{selectedFile.name}</p>
              <p className="text-[10px] text-slate-450 mt-1 font-semibold">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-800">Drag and drop file here</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">PDF, DOCX, PNG, or ZIP up to 50MB</p>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            disabled={!selectedFile || providers.length === 0}
            onClick={handleUpload}
          >
            Upload File
          </Button>
        </div>
      </div>
    </Modal>
  );
}
