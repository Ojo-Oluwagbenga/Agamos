import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the AGAMOS QR-code appointment attendance system work?',
      a: 'Upon completing your session reservation and payment via Paystack, a unique cryptographically signed single-use QR pass is generated and emailed to you. When you arrive at our Victoria Island suite, our concierge scans this pass via camera for instantaneous, touchless check-in verification.',
    },
    {
      q: 'Can I book an appointment as a guest without creating an account?',
      a: 'Yes. AGAMOS fully supports guest bookings. Simply provide your name, phone number, and email at checkout. If you choose to register an account later with the same email, your historical appointments and QR records will automatically link to your client sanctuary profile.',
    },
    {
      q: 'What is your cancellation and rescheduling policy?',
      a: 'Because our sanctuary suites operate on dedicated single-guest time allotments with turnover sanitization buffers, cancellations made at least 24 hours prior to appointment time are eligible for date rescheduling.',
    },
    {
      q: 'How are orders from the Beauty Store fulfilled?',
      a: 'You can choose between complimentary VIP Store Pickup at our Victoria Island Flagship Suite or discreet nationwide courier delivery across Nigeria.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all Nigerian debit cards, Mastercard, Visa, Verve, and instant bank transfers securely processed through Paystack.',
    },
  ];

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Client Inquiries
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-luxury-muted font-light leading-relaxed">
            Everything you need to know about reserving treatment sessions, QR attendance passes, and luxury cosmetic delivery.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-luxury-card border border-luxury-border overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center space-x-4 hover:bg-luxury-offblack/40 transition-colors"
                >
                  <span className="font-serif text-base sm:text-lg text-luxury-white font-medium">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-luxury-gold flex-shrink-0 transform transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-luxury-muted leading-relaxed border-t border-luxury-border/40 pt-4 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
