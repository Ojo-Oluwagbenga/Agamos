import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ShoppingBag, QrCode, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Booking, Order } from '../../types';
import { formatNGN, formatDate, formatTime12H } from '../../utils/formatters';
import { getQrCodeUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const CustomerDashboardPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForQR, setSelectedBookingForQR] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, oRes] = await Promise.all([
          api.bookings.getMyBookings(),
          api.orders.getMyOrders(),
        ]);
        setBookings(bRes);
        setOrders(oRes);
      } catch (err) {
        console.error('Failed to load customer dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingBookings = bookings.filter((b) =>
    ['CONFIRMED', 'PAID', 'PENDING'].includes(b.status)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
            Active Appointments
          </span>
          <p className="font-serif text-3xl text-luxury-white">{upcomingBookings.length}</p>
          <p className="text-[11px] text-luxury-muted">Scheduled in Victoria Island</p>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
            Store Orders
          </span>
          <p className="font-serif text-3xl text-luxury-white">{orders.length}</p>
          <p className="text-[11px] text-luxury-muted">Beauty store transactions</p>
        </div>

        <div className="bg-luxury-card border border-luxury-gold/40 p-6 space-y-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
              Quick Booking
            </span>
            <p className="text-xs text-luxury-muted mt-1">Reserve a new treatment session</p>
          </div>
          <Link to="/book">
            <Button variant="gold" size="sm" className="w-full">
              Schedule Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-luxury-border/60 pb-4">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-5 h-5 text-luxury-gold" />
            <h3 className="font-serif text-xl font-medium text-luxury-white">
              Upcoming Appointments
            </h3>
          </div>
          <Link to="/account/bookings" className="text-xs uppercase tracking-widest text-luxury-gold hover:underline">
            View All ({bookings.length})
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="py-8 text-center text-luxury-muted space-y-3">
            <Calendar className="w-10 h-10 text-luxury-darkmuted mx-auto" />
            <p className="font-serif text-base text-luxury-white">No Upcoming Appointments</p>
            <p className="text-xs">Schedule your next hair, spa, or styling session.</p>
            <Link to="/book">
              <Button variant="outline-gold" size="sm" className="mt-2">
                Book a Treatment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.slice(0, 3).map((b) => (
              <div
                key={b.id}
                className="bg-luxury-offblack border border-luxury-border/60 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase tracking-widest font-mono text-luxury-gold">
                      {b.booking_reference}
                    </span>
                    <Badge status={b.status} />
                  </div>
                  <h4 className="font-serif text-lg text-luxury-white">{b.service?.name}</h4>
                  <p className="text-xs text-luxury-muted flex items-center space-x-2">
                    <span>{formatDate(b.booking_date)}</span>
                    <span>&bull;</span>
                    <span>{formatTime12H(b.start_time)}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline-gold"
                    size="sm"
                    onClick={() => setSelectedBookingForQR(b)}
                    leftIcon={<QrCode className="w-3.5 h-3.5" />}
                  >
                    View QR Pass
                  </Button>
                  <Link to={`/booking/${b.booking_reference}`}>
                    <Button variant="ghost" size="sm">
                      Dossier
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-luxury-border/60 pb-4">
          <div className="flex items-center space-x-2.5">
            <ShoppingBag className="w-5 h-5 text-luxury-gold" />
            <h3 className="font-serif text-xl font-medium text-luxury-white">
              Recent Beauty Store Orders
            </h3>
          </div>
          <Link to="/account/orders" className="text-xs uppercase tracking-widest text-luxury-gold hover:underline">
            View All ({orders.length})
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-luxury-muted space-y-2">
            <p className="font-serif text-base text-luxury-white">No Orders Placed Yet</p>
            <p className="text-xs">Explore formulations in the AGAMOS Beauty Store.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="bg-luxury-offblack border border-luxury-border/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-luxury-gold font-semibold">{order.order_reference}</span>
                    <Badge status={order.status} />
                  </div>
                  <p className="text-luxury-muted mt-1">{order.items?.length || 0} formulation(s) &bull; {order.delivery_type_display}</p>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-semibold text-luxury-white">{formatNGN(order.total_amount)}</span>
                  <Link to={`/order/${order.order_reference}`}>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Pass Modal */}
      {selectedBookingForQR && (
        <Modal
          isOpen={!!selectedBookingForQR}
          onClose={() => setSelectedBookingForQR(null)}
          title="Attendance QR Pass"
          subtitle={`Reference: ${selectedBookingForQR.booking_reference}`}
          maxWidth="sm"
        >
          <div className="text-center space-y-4 py-2">
            <div className="bg-white p-4 inline-block shadow-lg mx-auto">
              <img
                src={getQrCodeUrl(selectedBookingForQR.qr_code, selectedBookingForQR.booking_reference, 'BOOKING')}
                alt="QR Pass"
                className="w-48 h-48 object-contain"
                onError={(e) => {
                  const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=AGAMOS:VERIFY:${selectedBookingForQR.qr_code?.secure_token || selectedBookingForQR.booking_reference}`;
                  if (e.currentTarget.src !== fallback) {
                    e.currentTarget.src = fallback;
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-lg text-luxury-white">
                {selectedBookingForQR.service?.name}
              </h4>
              <p className="text-xs text-luxury-gold">
                {formatDate(selectedBookingForQR.booking_date)} at {formatTime12H(selectedBookingForQR.start_time)}
              </p>
            </div>
            <p className="text-[11px] text-luxury-muted leading-relaxed max-w-xs mx-auto">
              Please present this pass to our concierge upon arrival at 12A Victoria Island Luxury Boulevard.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
