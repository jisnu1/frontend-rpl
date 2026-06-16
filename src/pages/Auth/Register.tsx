import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Lock, User, Mail } from 'lucide-react';
import logoUrl from '../../assets/horizon.png';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockoutTime, setLockoutTime] = useState<number>(() => {
    const saved = localStorage.getItem('lockout_register');
    if (!saved) return 0;
    const expiresAt = Number(saved);
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = 'Create Account - Horizon Cloud';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Daftar akun Horizon Cloud baru secara gratis untuk mengelola cloud storage personal dan mendapatkan VPS Storage Node 1 GB.');
    }
  }, []);

  React.useEffect(() => {
    if (lockoutTime <= 0) {
      localStorage.removeItem('lockout_register');
      return;
    }
    const timer = setInterval(() => {
      setLockoutTime(prev => {
        const next = prev - 1;
        if (next <= 0) {
          localStorage.removeItem('lockout_register');
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

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, hasMinLength: false, hasLetterAndDigit: false, hasUpperAndLower: false, hasSymbol: false };
    let score = 0;
    
    const hasMinLength = pass.length >= 8;
    if (hasMinLength) score += 1;
    
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasDigit = /\d/.test(pass);
    const hasLetterAndDigit = hasLetter && hasDigit;
    if (hasLetterAndDigit) score += 1;
    
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasUpperAndLower = hasUpper && hasLower;
    if (hasUpperAndLower) score += 1;
    
    const hasSymbol = /[@$!%*?&#^()\-_\=+]/.test(pass);
    if (hasSymbol) score += 1;
    
    return {
      score,
      hasMinLength,
      hasLetterAndDigit,
      hasUpperAndLower,
      hasSymbol
    };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (lockoutTime > 0) return;

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    if (strength.score < 2) {
      setError('Password minimal harus berwarna Kuning (minimal 8 karakter dengan kombinasi huruf dan angka).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ username, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/verify-registration', { state: { email } });
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
          const resetTime = reset ? Number(reset) : 900;
          setLockoutTime(resetTime);
          localStorage.setItem('lockout_register', String(Date.now() + resetTime * 1000));
        }
      }

      setError(
        err.response?.data?.message || 
        'Pendaftaran gagal. Username atau email mungkin sudah terdaftar.'
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
          <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Account</h2>
          
          {lockoutTime > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
              <span>Terlalu banyak percobaan registrasi. Silakan coba lagi dalam {formatTime(lockoutTime)}.</span>
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
              <span>Registrasi berhasil! Mengarahkan Anda ke halaman verifikasi...</span>
            </div>
          )}

          {remainingAttempts !== null && remainingAttempts > 0 && remainingAttempts <= 3 && lockoutTime <= 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/50 flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>Tersisa {remainingAttempts} kali percobaan pendaftaran sebelum terblokir.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Username"
              placeholder="Create a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={User}
              disabled={isSubmitting || success || lockoutTime > 0}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. jessica@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              disabled={isSubmitting || success || lockoutTime > 0}
            />

            <div className="space-y-1.5">
              <Input
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={Lock}
                disabled={isSubmitting || success || lockoutTime > 0}
              />
              
              {password && (
                <div className="space-y-1 px-1 text-left animate-fadeIn">
                  <div className="flex justify-between items-center text-[9px] font-bold">
                    <span className="text-slate-400">KEKUATAN SANDI:</span>
                    <span className={
                      strength.score === 1 ? 'text-rose-500 font-extrabold' :
                      strength.score === 2 ? 'text-amber-500 font-extrabold' :
                      strength.score === 3 ? 'text-emerald-450 font-extrabold' :
                      strength.score === 4 ? 'text-emerald-600 font-extrabold' : 'text-slate-400'
                    }>
                      {strength.score === 1 && 'Sangat Lemah'}
                      {strength.score === 2 && 'Sedang (Cukup)'}
                      {strength.score === 3 && 'Kuat'}
                      {strength.score === 4 && 'Sangat Kuat'}
                    </span>
                  </div>
                  
                  {/* Bar */}
                  <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-0.5">
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 1 ? 'bg-rose-500' : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 2 ? 'bg-amber-500' : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 3 ? 'bg-emerald-400' : 'bg-transparent'}`} />
                    <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strength.score >= 4 ? 'bg-emerald-600' : 'bg-transparent'}`} />
                  </div>
                  
                  {/* Checklist */}
                  <div className="flex flex-col gap-0.5 text-[9px] font-semibold text-slate-450 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors ${strength.hasMinLength ? 'bg-emerald-500' : 'bg-slate-350'}`} />
                      <span className={strength.hasMinLength ? 'text-slate-600 font-bold' : 'text-slate-400'}>Minimal 8 karakter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors ${strength.hasLetterAndDigit ? 'bg-emerald-500' : 'bg-slate-350'}`} />
                      <span className={strength.hasLetterAndDigit ? 'text-slate-600 font-bold' : 'text-slate-400'}>Kombinasi huruf & angka</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={Lock}
              disabled={isSubmitting || success || lockoutTime > 0}
            />

            {/* Terms and Privacy Policy Checkbox */}
            <div className="flex items-start gap-2.5 my-4 text-left">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer shrink-0"
                disabled={isSubmitting || success || lockoutTime > 0}
              />
              <label htmlFor="agree-terms" className="text-xs text-slate-500 font-semibold leading-relaxed cursor-pointer select-none">
                Saya setuju dengan{' '}
                <a 
                  href="/terms-of-service.txt" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline font-bold"
                >
                  Ketentuan Layanan
                </a>{' '}
                dan{' '}
                <a 
                  href="/privacy-policy.txt" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline font-bold"
                >
                  Kebijakan Privasi
                </a>{' '}
                Horizon Cloud.
              </label>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
              disabled={!agreed || success || lockoutTime > 0 || strength.score < 2 || password !== confirmPassword}
            >
              {lockoutTime > 0 ? `Terkunci (${formatTime(lockoutTime)})` : 'Sign Up'}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign In
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

