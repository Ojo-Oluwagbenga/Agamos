import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="border-b border-luxury-border pb-6">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Legal Terms of Engagement
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal mt-1">
            Terms & Conditions
          </h1>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-luxury-muted space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-serif text-lg text-luxury-white">1. Appointment Reservations & Sanctuary Ethics</h3>
            <p>
              Appointments at AGAMOS Luxury House are dedicated blocks designed for undivided aesthetic focus. Guests are requested to arrive 10 minutes prior to their confirmed schedule time. Attendance verification is conducted via single-use QR pass presented upon entry.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif text-lg text-luxury-white">2. Concurrency Guarantees & Cancellation Policy</h3>
            <p>
              To maintain the tranquility of our suites, appointments cancelled with less than 24 hours notice or marked as No-Show are subject to slot forfeiture and temporary reservation hold per administrator discretion.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif text-lg text-luxury-white">3. Beauty Store E-Commerce & Deliveries</h3>
            <p>
              Formulations purchased from the AGAMOS Beauty Store are artisanal cosmetics. Once opened or unsealed, products cannot be returned due to international cosmetic hygiene protocols.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif text-lg text-luxury-white">4. Payment Processing</h3>
            <p>
              All online payments are securely processed in Nigerian Naira (NGN) via Paystack gateway using 256-bit SSL encryption.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
