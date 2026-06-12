import React from 'react';
import { AlertTriangle, LucideIcon } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'success' | 'danger';
  isLoading?: boolean;
  icon?: LucideIcon;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  confirmVariant = 'primary',
  isLoading = false,
  icon = AlertTriangle,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} icon={icon}>
      <div className="space-y-4">
        <div className="text-sm text-slate-600 leading-relaxed">
          {message}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
