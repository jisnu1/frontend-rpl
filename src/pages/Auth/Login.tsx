import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Lock, Mail } from 'lucide-react';
import logoUrl from '../../assets/horizon.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = 'Sign In - Horizon Cloud';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Masuk ke akun Horizon Cloud Anda untuk mengelola penyimpanan, melakukan migrasi data, dan menggunakan asisten AI.');
    }
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  React.useEffect(() => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockoutTime > 0) return;

    if (!email.trim() || !password.trim()) {
      setError('Email dan Password wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
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
        'Login gagal. Periksa kembali email dan password Anda.'
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
          <img src={logoUrl} className="w-56 h-auto object-contain" alt="Horizon Cloud Logo" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Horizon Cloud</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Multi Storage Management</p>
        </div>

        {/* Card Form */}
        <Card hoverLift={false} className="p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sign In to Your Account</h2>

          {lockoutTime > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
              <span>Terlalu banyak percobaan login. Silakan coba lagi dalam {formatTime(lockoutTime)}.</span>
            </div>
          )}

          {error && lockoutTime <= 0 && (
            <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container text-xs font-bold border border-error/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts <= 3 && lockoutTime <= 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50 flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>Tersisa {remainingAttempts} kali percobaan login sebelum akun terkunci.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              disabled={isSubmitting || lockoutTime > 0}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={Lock}
              disabled={isSubmitting || lockoutTime > 0}
            />

            <div className="flex justify-end text-xs font-semibold">
              <Link to="/forgot-password" className="text-primary hover:underline font-bold">
                Lupa Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
              disabled={lockoutTime > 0}
            >
              {lockoutTime > 0 ? `Terkunci (${formatTime(lockoutTime)})` : 'Sign In'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-bold">
              Create Account
            </Link>
          </div>
        </Card>

        {/* Subtle Footer Links (Sitemap) */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-400 font-semibold">
          <Link to="/" className="hover:text-slate-600 transition-colors">Home</Link>
          <span>•</span>
          <a href="/privacy-policy.txt" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="/terms-of-service.txt" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}


