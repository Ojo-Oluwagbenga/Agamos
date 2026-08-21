import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AgamosLogo } from '../../components/brand/AgamosLogo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulateGoogleLogin = async () => {
    setSubmitting(true);
    try {
      // Simulates Google OAuth ID token for instant testing
      const testToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          email: 'vip.client@agamos.com',
          name: 'Victoria Adeyemi',
          given_name: 'Victoria',
          family_name: 'Adeyemi',
          sub: 'google_sub_123456',
        })
      )}.dummy_signature`;

      await googleLogin(testToken);
      navigate(from, { replace: true });
    } catch {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-white flex flex-col justify-center items-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <AgamosLogo variant="stacked" />
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-luxury-white mt-4">
            Sign In to Client Sanctuary
          </h2>
          <p className="text-xs text-luxury-muted">
            Access your bookings, QR passes, and bespoke order history.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-luxury-card border border-luxury-border p-8 space-y-6 shadow-2xl">
          {/* Quick Google OAuth CTA */}
          <button
            type="button"
            onClick={handleSimulateGoogleLogin}
            disabled={submitting}
            className="w-full py-3 px-4 bg-luxury-offblack border border-luxury-border hover:border-luxury-gold flex items-center justify-center space-x-3 text-xs uppercase tracking-widest font-medium text-luxury-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-luxury-border/60 w-full" />
            <span className="bg-luxury-card px-3 text-[10px] uppercase tracking-widest text-luxury-muted">
              Or with Password
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. admin@agamos.com or client@agamos.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right pt-1">
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-luxury-gold hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="md"
              className="w-full"
              isLoading={submitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Seed demo quick logins */}
          <div className="p-3 bg-luxury-offblack border border-luxury-border/60 text-[11px] text-luxury-muted space-y-1">
            <p className="font-semibold text-luxury-gold">Demo Accounts Available:</p>
            <p>&bull; <strong>Admin:</strong> admin@agamos.com / AgamosLuxury2026!</p>
            <p>&bull; <strong>Client:</strong> client@agamos.com / AgamosLuxury2026!</p>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-xs text-luxury-muted">
          New to AGAMOS?{' '}
          <Link to="/register" className="text-luxury-gold font-semibold hover:underline ml-1">
            Create a Profile
          </Link>
        </p>
      </div>
    </div>
  );
};
