import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, QrCode, Clock, MapPin, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Booking } from '../../types';
import { formatNGN, formatDate, formatTime12H } from '../../utils/formatters';
import { getQrCodeUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const { success, error } = useToast();

  const fetchBookings = async () => {
    try {
      const data = await api.bookings.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      await api.bookings.cancel(bookingToCancel.booking_reference);
      success('Booking Cancelled', `Appointment ${bookingToCancel.booking_reference} has been cancelled.`);
      setBookingToCancel(null);
      fetchBookings();
    } catch (err: any) {
      error('Cancellation Error', err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-luxury-border pb-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-luxury-white">
            Appointment Archive & QR Passes
          </h2>
          <p className="text-xs text-luxury-muted mt-0.5">
            View all confirmed, attended, and upcoming treatments.
          </p>
        </div>
        <Link to="/book">
          <Button variant="gold" size="sm">
            Book New Session
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-luxury-card border border-luxury-border p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-luxury-darkmuted mx-auto" />
          <h3 className="font-serif text-xl text-luxury-white">No Appointment History</h3>
          <p className="text-xs text-luxury-muted max-w-sm mx-auto">
            You do not have any archived treatment appointments yet.
          </p>
          <Link to="/book" className="inline-block pt-2">
            <Button variant="gold" size="md">
              Schedule First Treatment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => {
            const canCancel = ['PENDING', 'CONFIRMED', 'PAID'].includes(b.status);

            return (
              <div
                key={b.id}
                className="bg-luxury-card border border-luxury-border p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition-all hover:border-luxury-gold/40 shadow-xl"
              >
                {/* Info */}
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-luxury-gold font-semibold tracking-wider">
                      {b.booking_reference}
                    </span>
                    <Badge status={b.status} />
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-medium text-luxury-white">
                      {b.service?.name}
                    </h3>
                    <p className="text-xs text-luxury-gold font-medium mt-0.5">
                      {b.service?.category_name} &bull; {b.service?.duration_minutes} Mins
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs text-luxury-muted">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block">Date</span>
                      <span className="text-luxury-white font-medium">{formatDate(b.booking_date)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block">Time</span>
                      <span className="text-luxury-white font-medium">{formatTime12H(b.start_time)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider block">Total Amount</span>
                      <span className="text-luxury-white font-medium">{formatNGN(b.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-luxury-border/60 pt-4 lg:pt-0">
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setSelectedQR(b)}
                    leftIcon={<QrCode className="w-4 h-4" />}
                  >
                    Attendance Pass
                  </Button>

                  <Link to={`/booking/${b.booking_reference}`}>
                    <Button variant="outline-gold" size="sm">
                      Dossier
                    </Button>
                  </Link>

                  {canCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBookingToCancel(b)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Modal */}
      {selectedQR && (
        <Modal
          isOpen={!!selectedQR}
          onClose={() => setSelectedQR(null)}
          title="Attendance QR Pass"
          subtitle={`Reference: ${selectedQR.booking_reference}`}
          maxWidth="sm"
        >
          <div className="text-center space-y-4 py-2">
            <div className="bg-white p-4 inline-block shadow-lg mx-auto">
              <img
                src={getQrCodeUrl(selectedQR.qr_code, selectedQR.booking_reference, 'BOOKING')}
                alt="QR Pass"
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=AGAMOS:VERIFY:${selectedQR.qr_code?.secure_token || selectedQR.booking_reference}`;
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-lg text-luxury-white">{selectedQR.service?.name}</h4>
              <p className="text-xs text-luxury-gold">
                {formatDate(selectedQR.booking_date)} at {formatTime12H(selectedQR.start_time)}
              </p>
              <Badge status={selectedQR.status} className="mt-2" />
            </div>
            <p className="text-[11px] text-luxury-muted leading-relaxed max-w-xs mx-auto">
              Single-use pass. Present to reception concierge upon entering AGAMOS flagship suite.
            </p>
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Modal */}
      {bookingToCancel && (
        <Modal
          isOpen={!!bookingToCancel}
          onClose={() => setBookingToCancel(null)}
          title="Cancel Appointment"
          subtitle={`Reference: ${bookingToCancel.booking_reference}`}
          maxWidth="sm"
        >
          <div className="space-y-4 py-2 text-xs text-luxury-muted">
            <p>
              Are you sure you wish to cancel your reservation for{' '}
              <strong className="text-luxury-white">{bookingToCancel.service?.name}</strong> on{' '}
              <strong className="text-luxury-white">{formatDate(bookingToCancel.booking_date)}</strong>?
            </p>
            <p className="text-red-400">
              Per our policy, slot reservations will be released immediately to other waiting clients.
            </p>
            <div className="flex space-x-3 pt-4 border-t border-luxury-border">
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                isLoading={cancelling}
                onClick={handleCancel}
              >
                Confirm Cancellation
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setBookingToCancel(null)}
              >
                Keep Booking
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
