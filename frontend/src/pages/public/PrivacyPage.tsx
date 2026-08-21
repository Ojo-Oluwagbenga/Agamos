import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="border-b border-luxury-border pb-6">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Confidentiality & Data Protection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal mt-1">
            Privacy Policy
          </h1>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-luxury-muted space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h3 className="font-serif text-lg text-luxury-white">1. Client Data Discretion</h3>
            <p>
              AGAMOS treats client information with the highest degree of confidentiality. Information submitted during appointment booking, profile creation, and checkout is strictly used for service execution, QR token generation, and discreet transactional dispatches.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif text-lg text-luxury-white">2. Cryptographic QR Verification</h3>
            <p>
              Your appointment attendance passes are secured with HMAC-SHA256 cryptographic signatures. No personally identifiable financial data is embedded in client QR tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-serif text-lg text-luxury-white">3. Third-Party Integrations</h3>
            <p>
              Payments are executed via Paystack PCI-DSS compliant infrastructure. AGAMOS does not store payment card numbers on any server.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
