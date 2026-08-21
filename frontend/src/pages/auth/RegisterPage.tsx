import React, { useState } from 'react';
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
  const { register } = useAuth();
  const navigate = useNavigate();

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
