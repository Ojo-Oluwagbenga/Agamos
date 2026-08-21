import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      success('Dispatch Received', 'Our concierge will contact you within 2 business hours.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 600);
  };

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Private Concierge
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal">
            Connect with AGAMOS
          </h1>
          <p className="text-sm text-luxury-muted font-light leading-relaxed">
            Our private concierge team is available to assist with bespoke bridal bookings, corporate retreats, and international orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 bg-luxury-card border border-luxury-border p-8 space-y-8">
            <h3 className="font-serif text-2xl font-medium text-luxury-white border-b border-luxury-border/60 pb-4">
              Flagship Concierge
            </h3>

            <div className="space-y-6 text-xs text-luxury-muted">
              <div className="flex items-start space-x-3.5">
                <MapPin className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-luxury-white uppercase tracking-wider mb-1">Location</h4>
                  <p>12A Victoria Island Luxury Boulevard, Lagos, Nigeria</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Phone className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-luxury-white uppercase tracking-wider mb-1">Direct Telephone</h4>
                  <p>+234 800 242 6670 &bull; +234 801 234 5678</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <Mail className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-luxury-white uppercase tracking-wider mb-1">Electronic Mail</h4>
                  <p>concierge@agamos.com &bull; orders@agamos.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5 pt-4 border-t border-luxury-border/60">
                <Clock className="w-5 h-5 text-luxury-gold flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-luxury-white uppercase tracking-wider mb-1">Operating Hours</h4>
                  <p>Monday – Saturday: 9:00 AM – 7:00 PM</p>
                  <p>Sunday: 12:00 PM – 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="lg:col-span-7 bg-luxury-card border border-luxury-border p-8 space-y-6">
            <h3 className="font-serif text-2xl font-medium text-luxury-white border-b border-luxury-border/60 pb-4">
              Send a Private Inquiry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name *"
                  placeholder="e.g. Victoria Adeyemi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="e.g. victoria@agamos.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Inquiry Subject *"
                placeholder="e.g. VIP Bridal Suite Booking"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />

              <div className="space-y-1.5 text-left">
                <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
                  Message Body *
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe your inquiry or treatment requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold transition-colors"
                />
              </div>

              <Button
                type="submit"
                variant="gold"
                size="md"
                className="w-full"
                isLoading={submitting}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Transmit Inquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
