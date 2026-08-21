import React, { useState, useEffect } from 'react';
import { User, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || user.profile?.phone || '');
      setAddress(user.profile?.address || '');
      setNotes(user.profile?.notes || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        profile: {
          phone,
          address,
          notes,
        },
      });
    } catch (err: any) {
      // error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-luxury-card border border-luxury-border p-6 sm:p-10 space-y-8 animate-fade-in shadow-2xl">
      <div className="border-b border-luxury-border/60 pb-4">
        <h2 className="font-serif text-2xl font-normal text-luxury-white">
          Client Profile & Preferences
        </h2>
        <p className="text-xs text-luxury-muted mt-0.5">
          Manage your personal identity, contact details, and private treatment preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Email Address (Immutable)"
            type="email"
            value={user?.email || ''}
            disabled
            className="opacity-70 cursor-not-allowed"
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 801 234 5678"
          />
        </div>

        <Input
          label="Default Shipping / Home Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 4 Banana Island Road, Ikoyi, Lagos"
        />

        <div className="space-y-1.5 text-left">
          <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
            Personal Care Preferences & Allergy Disclosures
          </label>
          <textarea
            rows={3}
            placeholder="Specify any fragrance preferences, scalp treatments, or skin sensitivity disclosures..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold transition-colors"
          />
        </div>

        <div className="pt-4 border-t border-luxury-border/60 flex justify-end">
          <Button type="submit" variant="gold" size="md" isLoading={submitting}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
