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
  
  const { register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = 'Create Account - Horizon Cloud';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Daftar akun Horizon Cloud baru secara gratis untuk mengelola cloud storage personal dan mendapatkan VPS Storage Node 1 GB.');
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {

    e.preventDefault();
    setError('');
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Semua kolom wajib diisi.');
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
          
          {error && (
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              placeholder="Create a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={User}
              disabled={isSubmitting || success}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. jessica@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              disabled={isSubmitting || success}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={Lock}
              disabled={isSubmitting || success}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={Lock}
              disabled={isSubmitting || success}
            />

            {/* Terms and Privacy Policy Checkbox */}
            <div className="flex items-start gap-2.5 my-4 text-left">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary cursor-pointer shrink-0"
                disabled={isSubmitting || success}
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
              disabled={!agreed || success}
            >
              Sign Up
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

