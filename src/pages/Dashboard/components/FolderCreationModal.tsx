import React from 'react';
import { FolderPlus } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

interface FolderCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export default function FolderCreationModal({
  isOpen,
  onClose,
  newFolderName,
  setNewFolderName,
  onSubmit,
  isLoading
}: FolderCreationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Folder Baru"
      icon={FolderPlus}
    >
      <form onSubmit={onSubmit} className="space-y-4 animate-fadeIn" noValidate>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Nama Folder
          </label>
          <input
            type="text"
            required
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Masukkan nama folder..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 px-4 text-base md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Buat Folder
          </Button>
        </div>
      </form>
    </Modal>
  );
}
