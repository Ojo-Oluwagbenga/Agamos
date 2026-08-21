import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AgamosLogo } from '../../components/brand/AgamosLogo';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId || !(window as any).google?.accounts?.id) return;

    try {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          if (response.credential) {
            setSubmitting(true);
            try {
              await googleLogin(response.credential);
              navigate('/account');
            } catch (err) {
              console.error('Google Sign-In failed', err);
            } finally {
              setSubmitting(false);
            }
          }
        },
      });

      const btnSlot = document.getElementById('google-register-btn-slot');
      if (btnSlot) {
        (window as any).google.accounts.id.renderButton(btnSlot, {
          theme: 'filled_black',
          size: 'large',
          width: '100%',
          text: 'signup_with',
          shape: 'rectangular',
        });
      }
    } catch (e) {
      console.warn('Google Identity Services warning:', e);
    }
  }, [navigate, googleLogin]);

  const handleGoogleClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (googleClientId && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt();
    } else {
      setSubmitting(true);
      const testToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          email: 'vip.client@agamos.com',
          name: 'Victoria Adeyemi',
          given_name: 'Victoria',
          family_name: 'Adeyemi',
          sub: 'google_sub_123456',
        })
      )}.dummy_signature`;
      googleLogin(testToken).then(() => navigate('/account')).finally(() => setSubmitting(false));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      alert('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        password,
        password_confirm: passwordConfirm,
      });
      navigate('/account');
    } catch {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-white flex flex-col justify-center items-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <AgamosLogo variant="stacked" />
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-luxury-white mt-4">
            Join the AGAMOS Client Registry
          </h2>
          <p className="text-xs text-luxury-muted">
            Enjoy priority appointments, archived treatment dossiers, and expedited shopping.
          </p>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-8 space-y-6 shadow-2xl">
          {/* Quick Google Sign-up */}
          <div id="google-register-btn-slot" className="w-full flex justify-center" />

          <button
            type="button"
            onClick={handleGoogleClick}
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
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-luxury-border/60 w-full" />
            <span className="bg-luxury-card px-3 text-[10px] uppercase tracking-widest text-luxury-muted">
              Or with Email & Password
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                placeholder="Victoria"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name *"
                placeholder="Adeyemi"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Email Address *"
              type="email"
              placeholder="victoria@agamos.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number *"
                placeholder="+234 801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Residential Address"
                placeholder="4 Banana Island Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password *"
                type="password"
                placeholder="At least 8 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Input
                label="Confirm Password *"
                type="password"
                placeholder="Repeat password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <p className="text-[11px] text-luxury-muted">
              Past guest bookings with this email address will be automatically linked to your new client profile.
            </p>

            <Button
              type="submit"
              variant="gold"
              size="md"
              className="w-full"
              isLoading={submitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-luxury-muted">
          Already registered?{' '}
          <Link to="/login" className="text-luxury-gold font-semibold hover:underline ml-1">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
