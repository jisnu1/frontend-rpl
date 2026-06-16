import React from 'react';
import { User, UserCheck, Phone, HardDrive } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { formatSize } from '../../../utils/fileHelpers';

interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles?: string[];
}

interface UserStorageResponse {
  usedBytes: number;
  quotaBytes: number;
}

interface ProfileSectionProps {
  user: UserDto | null;
  fullName: string;
  setFullName: (val: string) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  avatarUrl: string;
  setAvatarUrl: (val: string) => void;
  isSavingProfile: boolean;
  handleSaveProfile: (e: React.FormEvent) => void;
  personalStorage: UserStorageResponse | null;
}

export default function ProfileSection({
  user,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  avatarUrl,
  setAvatarUrl,
  isSavingProfile,
  handleSaveProfile,
  personalStorage
}: ProfileSectionProps) {
  // Preset Avatars using Dicebear
  const avatarPresets = [
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=2563eb,4f46e5`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=059669,0d9488`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=e11d48,dc2626`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=d97706,ea580c`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=7c3aed,c084fc`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username || 'User'}&backgroundColor=475569,71717a`,
  ];

  const calculatePercent = (used: number, total: number) => {
    if (!total) return 0;
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const localUsed = personalStorage?.usedBytes || 0;
  const localTotal = personalStorage?.quotaBytes || 1073741824;
  const localPercent = calculatePercent(localUsed, localTotal);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* User Profile Card */}
      <Card hoverLift={false} className="p-6 md:p-8">
        <div className="flex items-center gap-5 border-b border-slate-100 pb-6 mb-6">
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.username}
                className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-primary/20 hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-2 border-primary/20">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-primary text-white rounded-full shadow-sm">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {user?.username || 'User Profile'}
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
                {user?.roles?.[0]?.replace('ROLE_', '') || 'USER'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
          {/* Avatar Preset Custom Editor */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Kustomisasi Avatar
            </label>
            <div className="flex flex-wrap items-center gap-4">
              {/* Preset Grid */}
              <div className="flex gap-2">
                {avatarPresets.map((preset, idx) => {
                  const isSelected = avatarUrl === preset;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-9 h-9 rounded-full border-2 transition-all overflow-hidden hover:scale-105 active:scale-95 cursor-pointer ${
                        isSelected 
                          ? 'border-primary ring-2 ring-primary/20 scale-105 shadow-md' 
                          : 'border-transparent hover:border-slate-350'
                      }`}
                      title={`Preset Avatar ${idx + 1}`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

              {/* Custom URL Input */}
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Atau masukkan URL foto kustom..."
                  value={avatarPresets.includes(avatarUrl) ? '' : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Form Input fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap Anda"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={User}
            />
            <Input
              label="Nomor Telepon"
              placeholder="e.g. 08123456789"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={Phone}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingProfile}
              className="px-6 rounded-full font-bold shadow-md hover:shadow-lg transition-all"
            >
              Simpan Profil
            </Button>
          </div>
        </form>
      </Card>

      {/* Local Storage Quota Card */}
      <Card hoverLift={false} className="p-6 md:p-8 border-l-4 border-l-primary">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-primary rounded-2xl shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-800">Horizon Local Storage</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed font-semibold">
              Penyimpanan Personal Multistorage Management yang di-host langsung pada server Horizon VPS lokal Anda.
            </p>

            {personalStorage && (
              <div className="mt-4 max-w-md">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1.5">
                  <span>Pemakaian Personal Multistorage Management</span>
                  <span>
                    {formatSize(localUsed)} / {formatSize(localTotal)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      localPercent > 85 ? 'bg-error' : localPercent > 60 ? 'bg-amber-400' : 'bg-primary'
                    }`} 
                    style={{ width: `${localPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-450 font-black">
                  Anda telah menggunakan {localPercent}% dari kuota penyimpanan.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
