import React, { useEffect, useState } from 'react';
import { Save, Sparkles, Building, Truck } from 'lucide-react';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubheadline, setHeroSubheadline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [deliveryFlatFee, setDeliveryFlatFee] = useState('3500');

  const { success, error } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.cms.getOverview();
        if (res.settings) {
          setHeroHeadline(res.settings.hero_headline || '');
          setHeroSubheadline(res.settings.hero_subheadline || '');
          setAddress(res.settings.address || '');
          setPhone(res.settings.contact_phone || '');
          setEmail(res.settings.contact_email || '');
          setInstagram(res.settings.social_instagram || '');
          setFacebook(res.settings.social_facebook || '');
          setDeliveryFlatFee(String(res.settings.delivery_flat_fee || '3500'));
        }
      } catch (err: any) {
        error('Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [error]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.cms.updateSettings({
        hero_headline: heroHeadline,
        hero_subheadline: heroSubheadline,
        address,
        contact_phone: phone,
        contact_email: email,
        social_instagram: instagram,
        social_facebook: facebook,
        delivery_flat_fee: deliveryFlatFee,
      });
      success('Settings Updated', 'Dynamic CMS content and pricing updated live.');
    } catch (err: any) {
      error('Failed to Save', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-luxury-muted">Loading site configuration...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="border-b border-luxury-border pb-6">
        <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
          Dynamic CMS & Operations
        </span>
        <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
          Site Settings & Global Parameters
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Hero Section Copy */}
        <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-luxury-gold border-b border-luxury-border/60 pb-3">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">
              Homepage Hero Section
            </h3>
          </div>

          <Input
            label="Hero Editorial Headline"
            value={heroHeadline}
            onChange={(e) => setHeroHeadline(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
              Hero Subheadline Narrative
            </label>
            <textarea
              rows={3}
              value={heroSubheadline}
              onChange={(e) => setHeroSubheadline(e.target.value)}
              className="w-full bg-luxury-offblack text-luxury-white border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold"
              required
            />
          </div>
        </div>

        {/* Courier & Delivery Parameters */}
        <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-luxury-gold border-b border-luxury-border/60 pb-3">
            <Truck className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">
              E-Commerce Fulfillment Parameters
            </h3>
          </div>

          <Input
            label="Nationwide Courier Flat Rate (NGN)"
            type="number"
            value={deliveryFlatFee}
            onChange={(e) => setDeliveryFlatFee(e.target.value)}
            required
          />
        </div>

        {/* Flagship Contact Info */}
        <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 text-luxury-gold border-b border-luxury-border/60 pb-3">
            <Building className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">
              Flagship Suite & Social Dispatches
            </h3>
          </div>

          <Input
            label="Flagship Suite Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Concierge Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Electronic Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Instagram URL"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
            <Input
              label="Facebook URL"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="gold"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
