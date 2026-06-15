import React, { useState, FormEvent, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyRegistration, resendRegistrationOtp } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Mail, ShieldCheck, Cloud } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function VerifyRegistration() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    // Ambil email dari state router jika ditransfer dari halaman Register
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setEmail(stateEmail);
    } else {
      // Jika diakses langsung tanpa email di state, arahkan ke register
      setError('Silakan mendaftar terlebih dahulu untuk melakukan verifikasi.');
      setTimeout(() => {
        navigate('/register');
      }, 3000);
    }
  }, [location, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockoutTime > 0) return;

    if (!email.trim()) {
      setError('Email tidak boleh kosong.');
      return;
    }

    if (!otp.trim()) {
      setError('Kode OTP wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyRegistration({ email, otp });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
          if (reset) {
            setLockoutTime(Number(reset));
          } else {
            setLockoutTime(900); // 15 menit fallback
          }
        }
      }

      setError(
        err.response?.data?.message || 
        'Verifikasi gagal. Kode OTP salah atau sudah kedaluwarsa.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || lockoutTime > 0) return;
    setError('');
    setIsResending(true);
    try {
      await resendRegistrationOtp(email);
      setResendCountdown(60);
      toastSuccess('Kode OTP baru berhasil dikirim ke email Anda.');
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
          if (reset) {
            setLockoutTime(Number(reset));
          } else {
            setLockoutTime(900); // 15 menit fallback
          }
        }
      }

      const msg = err.response?.data?.message || 'Gagal mengirim ulang kode OTP. Silakan coba lagi.';
      setError(msg);
      toastError(msg);
    } finally {
      setIsResending(false);
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
          <h2 className="text-xl font-bold text-slate-900 mb-2">Verifikasi Akun</h2>
          <p className="text-xs text-slate-400 font-semibold mb-6">
            Masukkan kode OTP yang dikirimkan ke email Anda untuk mengaktifkan akun.
          </p>
          
          {lockoutTime > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
              <span>Terlalu banyak percobaan verifikasi. Silakan coba lagi dalam {formatTime(lockoutTime)}.</span>
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
              <span>Verifikasi berhasil! Mengarahkan Anda ke halaman login...</span>
            </div>
          )}

          {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts <= 3 && lockoutTime <= 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50 flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>Tersisa {remainingAttempts} kali percobaan verifikasi sebelum terblokir.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isSubmitting || success || !email || lockoutTime > 0}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
              disabled={success || !email || lockoutTime > 0}
            >
              {lockoutTime > 0 ? `Terkunci (${formatTime(lockoutTime)})` : 'Verifikasi'}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs">
            <span className="text-slate-500 font-semibold">Tidak menerima kode? </span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending || resendCountdown > 0 || !email || lockoutTime > 0}
              className="text-primary hover:underline font-bold disabled:text-slate-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed bg-transparent border-none p-0 inline"
            >
              {resendCountdown > 0 ? `Kirim Ulang (${resendCountdown}s)` : 'Kirim Ulang OTP'}
            </button>
          </div>

          {/* Links */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-500 flex justify-between">
            <Link to="/register" className="text-primary hover:underline font-bold">
              Kembali ke Daftar
            </Link>
            <Link to="/login" className="text-primary hover:underline font-bold">
              Masuk
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
