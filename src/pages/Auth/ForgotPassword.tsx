import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestForgotPassword, resetPassword } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Mail, Key, ShieldCheck, Cloud, Lock } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Request OTP, Step 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutTime, setLockoutTime] = useState<number>(() => {
    const saved = localStorage.getItem('lockout_forgot_password');
    if (!saved) return 0;
    const expiresAt = Number(saved);
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });

  React.useEffect(() => {
    if (lockoutTime <= 0) {
      localStorage.removeItem('lockout_forgot_password');
      return;
    }
    const timer = setInterval(() => {
      setLockoutTime(prev => {
        const next = prev - 1;
        if (next <= 0) {
          localStorage.removeItem('lockout_forgot_password');
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (lockoutTime > 0) return;

    if (!email.trim()) {
      setError('Email wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestForgotPassword(email);
      setSuccess('Kode OTP telah dikirimkan ke email Anda.');
      setRemainingAttempts(null);
      setLockoutTime(0);
      localStorage.removeItem('lockout_forgot_password');
      setStep(2);
    } catch (err: any) {
      console.error(err);

      const headers = err.response?.headers;
      if (headers) {
        const remaining = headers['x-ratelimit-remaining'];
        if (remaining !== undefined) {
          setRemainingAttempts(Number(remaining));
        }

        if (err.response?.status === 429) {
          const reset = headers['x-ratelimit-reset'] || headers['retry-after'];
          const resetTime = reset ? Number(reset) : 900;
          setLockoutTime(resetTime);
          localStorage.setItem('lockout_forgot_password', String(Date.now() + resetTime * 1000));
        }
      }

      setError(
        err.response?.data?.message || 
        'Gagal mengirimkan permintaan reset password. Pastikan email Anda terdaftar.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (lockoutTime > 0) return;

    if (!otp.trim()) {
      setError('Kode OTP wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password baru minimal harus 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ email, otp, newPassword });
      setSuccess('Password Anda berhasil diperbarui! Mengarahkan ke halaman login...');
      localStorage.removeItem('lockout_forgot_password');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      console.error(err);

      const headers = err.response?.headers;
      if (headers) {
        const remaining = headers['x-ratelimit-remaining'];
        if (remaining !== undefined) {
          setRemainingAttempts(Number(remaining));
        }

        if (err.response?.status === 429) {
          const reset = headers['x-ratelimit-reset'] || headers['retry-after'];
          const resetTime = reset ? Number(reset) : 900;
          setLockoutTime(resetTime);
          localStorage.setItem('lockout_forgot_password', String(Date.now() + resetTime * 1000));
        }
      }

      setError(
        err.response?.data?.message || 
        'Gagal mereset password. Kode OTP salah atau sudah kedaluwarsa.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/25">
            <Cloud className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Horizon Drive</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Personal Multistorage Management</p>
        </div>

        {/* Card Form */}
        <Card hoverLift={false} className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lupa Password</h2>
          <p className="text-xs text-slate-400 font-semibold mb-6">
            {step === 1 
              ? 'Masukkan alamat email Anda untuk menerima kode OTP verifikasi reset password.'
              : 'Masukkan kode OTP dan buat kata sandi baru Anda.'}
          </p>
          
          {lockoutTime > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
              <span>Terlalu banyak percobaan. Silakan coba lagi dalam {formatTime(lockoutTime)}.</span>
            </div>
          )}

          {error && lockoutTime <= 0 && (
            <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold border border-error/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-250 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span>{success}</span>
            </div>
          )}

          {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts <= 3 && lockoutTime <= 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50 flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>Tersisa {remainingAttempts} kali percobaan sebelum terblokir.</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <Input
                label="Alamat Email"
                type="email"
                placeholder="Masukkan email terdaftar Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={Mail}
                disabled={isSubmitting || lockoutTime > 0}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isSubmitting}
                disabled={lockoutTime > 0}
              >
                {lockoutTime > 0 ? `Terkunci (${formatTime(lockoutTime)})` : 'Minta OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="Alamat Email (Tidak Dapat Diubah)"
                type="email"
                placeholder="email@example.com"
                value={email}
                readOnly={true}
                disabled={true}
                leftIcon={Mail}
                className="bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
              />

              <Input
                label="Kode OTP"
                placeholder="Masukkan kode OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                leftIcon={ShieldCheck}
                disabled={isSubmitting || lockoutTime > 0}
              />

              <Input
                label="Password Baru"
                type="password"
                placeholder="Buat password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={Lock}
                disabled={isSubmitting || lockoutTime > 0}
              />

              <Input
                label="Konfirmasi Password Baru"
                type="password"
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={Lock}
                disabled={isSubmitting || lockoutTime > 0}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isSubmitting}
                disabled={lockoutTime > 0}
              >
                {lockoutTime > 0 ? `Terkunci (${formatTime(lockoutTime)})` : 'Reset Password'}
              </Button>
            </form>
          )}

          {/* Links */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-500 flex justify-between">
            {step === 2 && (
              <button 
                type="button" 
                onClick={() => { setStep(1); setRemainingAttempts(null); setLockoutTime(0); }} 
                className="text-primary hover:underline font-bold"
              >
                Kembali
              </button>
            )}
            <Link to="/login" className="text-primary hover:underline font-bold ml-auto">
              Masuk
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
