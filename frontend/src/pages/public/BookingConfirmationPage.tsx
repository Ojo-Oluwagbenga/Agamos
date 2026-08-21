import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, QrCode, Calendar, Clock, MapPin, Download, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Booking } from '../../types';
import { formatNGN, formatDate, formatTime12H } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const BookingConfirmationPage: React.FC = () => {
  const { id: referenceParam } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reference = referenceParam || searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    const loadBooking = async () => {
      const initialRef = referenceParam || searchParams.get('reference') || searchParams.get('trxref');
      if (!initialRef) {
        setErrorMsg('No booking reference provided.');
        setLoading(false);
        return;
      }

      try {
        let bookingRefToFetch = initialRef;
        const trxRef = searchParams.get('reference') || searchParams.get('trxref');

        // If query param indicates Paystack redirect callback
        if (trxRef) {
          try {
            const verifyRes = await api.payments.verify(trxRef);
            if (verifyRes?.booking_reference) {
              bookingRefToFetch = verifyRes.booking_reference;
            }
          } catch (e) {
            console.warn('Payment verify verification error:', e);
          }
        }

        const data = await api.bookings.getByRef(bookingRefToFetch);
        setBooking(data);

        // Fire luxury gold confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F5D77F', '#FFFFFF', '#AA8820'],
        });
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not find booking record.');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [referenceParam, searchParams]);

  if (loading) {
    return (
      <div className="bg-luxury-black min-h-screen pt-36 pb-20 flex flex-col justify-center items-center text-luxury-white space-y-4">
        <div className="w-12 h-12 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-luxury-muted">Verifying appointment status...</p>
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="bg-luxury-black min-h-screen pt-36 pb-20 text-center text-luxury-white px-4">
        <div className="max-w-md mx-auto bg-luxury-card border border-luxury-border p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="font-serif text-2xl">Booking Not Found</h2>
          <p className="text-xs text-luxury-muted leading-relaxed">{errorMsg || 'Please verify your booking reference number.'}</p>
          <Link to="/book" className="block pt-2">
            <Button variant="outline-gold" size="sm">
              Schedule New Appointment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const qrImageUrl = booking.qr_code?.qr_image || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AGAMOS:VERIFY:${booking.qr_code?.secure_token || booking.booking_reference}`;

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        {/* Celebration Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-luxury-offblack border border-luxury-gold rounded-full flex items-center justify-center mx-auto mb-2 shadow-gold-glow">
            <CheckCircle2 className="w-8 h-8 text-luxury-gold" />
          </div>
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Appointment Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal">
            Your Sanctuary is Prepared
          </h1>
          <p className="text-xs text-luxury-muted font-light max-w-lg mx-auto leading-relaxed">
            A confirmation dossier and secure QR token have been dispatched to{' '}
            <span className="text-luxury-white font-medium">{booking.guest_email}</span>.
          </p>
        </div>

        {/* Booking Dossier Card */}
        <div className="bg-luxury-card border border-luxury-border overflow-hidden shadow-2xl">
          {/* Top Gold Foil Strip */}
          <div className="bg-gradient-to-r from-luxury-card via-luxury-gold/20 to-luxury-card p-4 border-b border-luxury-border flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="font-serif text-base tracking-widest text-luxury-gold">
              DOSSIER REFERENCE: {booking.booking_reference}
            </span>
            <Badge status={booking.status} />
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left QR Code Attendance Pass */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-luxury-offblack border border-luxury-gold/40 text-center space-y-4 shadow-gold-subtle">
              <div className="bg-white p-3 shadow-md">
                <img
                  src={qrImageUrl}
                  alt={`QR code for ${booking.booking_reference}`}
                  className="w-44 h-44 object-contain"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-luxury-gold block">
                  Secure Attendance QR Pass
                </span>
                <p className="text-[10px] text-luxury-muted max-w-[200px] leading-tight">
                  Present this QR pass to the concierge upon arrival for single-use check-in verification.
                </p>
              </div>
            </div>

            {/* Right Appointment Details */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
                  {booking.service?.category_name || 'Bespoke Treatment'}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-luxury-white mt-1">
                  {booking.service?.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-luxury-border/60 text-xs">
                <div className="space-y-1">
                  <span className="text-luxury-muted flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Appointment Date</span>
                  </span>
                  <p className="font-medium text-luxury-white text-sm">{formatDate(booking.booking_date)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-luxury-muted flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-luxury-gold" />
                    <span>Appointment Time</span>
                  </span>
                  <p className="font-medium text-luxury-white text-sm">
                    {formatTime12H(booking.start_time)} – {formatTime12H(booking.end_time)}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-luxury-muted">Guest Name</span>
                  <p className="font-medium text-luxury-white">{booking.guest_name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-luxury-muted">Total Paid</span>
                  <p className="font-medium text-luxury-gold text-sm">{formatNGN(booking.total_amount)}</p>
                </div>
              </div>

              {/* Flagship Location */}
              <div className="flex items-start space-x-2.5 text-xs text-luxury-muted">
                <MapPin className="w-4 h-4 text-luxury-gold flex-shrink-0 mt-0.5" />
                <span>
                  <strong>AGAMOS Flagship Suite:</strong> 12A Victoria Island Luxury Boulevard, Lagos, Nigeria
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Next Steps */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline-gold" size="md" className="w-full">
              Return to Homepage
            </Button>
          </Link>
          <Link to="/account/bookings" className="w-full sm:w-auto">
            <Button variant="gold" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View in My Client Sanctuary
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
