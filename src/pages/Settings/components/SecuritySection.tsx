import React from 'react';
import { Key, Lock } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

interface SecuritySectionProps {
  oldPassword: string;
  setOldPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  isSavingPassword: boolean;
  handleSavePassword: (e: React.FormEvent) => void;
  passwordError: string;
}

export default function SecuritySection({
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isSavingPassword,
  handleSavePassword,
  passwordError
}: SecuritySectionProps) {
  return (
    <Card hoverLift={false} className="p-6 md:p-8 animate-fadeIn">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
        <Key className="text-primary w-5 h-5" />
        <h2 className="text-base font-bold text-slate-800">Keamanan Kata Sandi</h2>
      </div>
      
      <p className="text-xs text-slate-400 font-semibold mb-6">
        Perbarui kata sandi Anda secara berkala untuk menjaga akun Horizon Drive tetap aman dari akses tidak sah.
      </p>

      {passwordError && (
        <div className="mb-5 p-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold border border-error/20 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
          <span>{passwordError}</span>
        </div>
      )}

      <form onSubmit={handleSavePassword} className="space-y-4" noValidate>
        <Input
          label="Kata Sandi Lama"
          type="password"
          placeholder="Masukkan kata sandi saat ini"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          leftIcon={Lock}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Kata Sandi Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={Lock}
          />
          <Input
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            placeholder="Ulangi kata sandi baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={Lock}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSavingPassword}
            className="px-6 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
          >
            Perbarui Password
          </Button>
        </div>
      </form>
    </Card>
  );
}
