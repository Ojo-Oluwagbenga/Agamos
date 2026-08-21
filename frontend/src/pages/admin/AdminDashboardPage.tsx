import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  ShoppingBag,
  AlertTriangle,
  QrCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardMetrics, Booking, Order, Product } from '../../types';
import { formatNGN, formatTime12H, formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<{
    metrics: DashboardMetrics;
    today_agenda: Booking[];
    recent_bookings: Booking[];
    recent_orders: Order[];
    low_stock_items: Product[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const res = await api.admin.getMetrics();
      setData(res);
    } catch (err: any) {
      error('Admin Notice', err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAttended = async (bookingId: string) => {
    try {
      await api.admin.updateBooking(bookingId, { status: 'ATTENDED' });
      success('Status Updated', 'Booking marked as ATTENDED.');
      loadData();
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const handleMarkNoShow = async (bookingId: string) => {
    try {
      await api.admin.updateBooking(bookingId, { status: 'NO_SHOW' });
      success('Status Updated', 'Booking marked as NO_SHOW. Customer booking access suspended per policy.');
      loadData();
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-luxury-muted">
        <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs uppercase tracking-widest">Loading executive telemetry...</p>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, today_agenda, recent_bookings, recent_orders, low_stock_items } = data;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-luxury-border pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Executive Command
          </span>
          <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
            AGAMOS Operations Overview
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/admin/scanner">
            <Button variant="gold" size="sm" leftIcon={<QrCode className="w-4 h-4" />}>
              Open QR Scanner
            </Button>
          </Link>
          <Link to="/admin/bookings">
            <Button variant="outline-gold" size="sm">
              All Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-2 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold">
            Total Gross Revenue
          </span>
          <p className="font-serif text-3xl font-medium text-luxury-white">
            {metrics.total_revenue_formatted}
          </p>
          <p className="text-[11px] text-luxury-muted">
            This Month: <strong className="text-luxury-white">{metrics.monthly_revenue_formatted}</strong>
          </p>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-2 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold">
            Today's Appointments
          </span>
          <p className="font-serif text-3xl font-medium text-luxury-white">
            {today_agenda.length}
          </p>
          <p className="text-[11px] text-luxury-muted">
            Total Upcoming: <strong className="text-luxury-white">{metrics.upcoming_bookings}</strong>
          </p>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-2 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold">
            Store Orders Pending
          </span>
          <p className="font-serif text-3xl font-medium text-luxury-white">
            {metrics.pending_orders}
          </p>
          <p className="text-[11px] text-luxury-muted">
            Total Orders: <strong className="text-luxury-white">{metrics.total_orders}</strong>
          </p>
        </div>

        <div className="bg-luxury-card border border-luxury-border p-6 space-y-2 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
            Low-Stock Warnings
          </span>
          <p className="font-serif text-3xl font-medium text-luxury-white">
            {metrics.low_stock_count}
          </p>
          <p className="text-[11px] text-luxury-muted">
            Catalog Size: <strong className="text-luxury-white">{metrics.total_products}</strong> items
          </p>
        </div>
      </div>

      {/* Today's Sanctuary Agenda */}
      <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-luxury-border/60 pb-4">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-luxury-gold" />
            <h3 className="font-serif text-xl font-medium text-luxury-white">
              Today's Appointment Agenda ({today_agenda.length})
            </h3>
          </div>
          <Link to="/admin/scanner" className="text-xs uppercase tracking-widest text-luxury-gold hover:underline">
            Scan Client QR Code
          </Link>
        </div>

        {today_agenda.length === 0 ? (
          <div className="py-8 text-center text-luxury-muted space-y-1">
            <p className="font-serif text-base text-luxury-white">No Appointments Scheduled for Today</p>
            <p className="text-xs">Upcoming appointments will populate dynamically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {today_agenda.map((booking) => (
              <div
                key={booking.id}
                className="bg-luxury-offblack border border-luxury-border/80 p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-luxury-gold font-semibold">
                      {booking.booking_reference}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-luxury-card text-luxury-white border border-luxury-border">
                      {formatTime12H(booking.start_time)} – {formatTime12H(booking.end_time)}
                    </span>
                    <Badge status={booking.status} />
                  </div>
                  <h4 className="font-serif text-lg text-luxury-white">
                    {booking.guest_name} &bull; <span className="text-luxury-gold">{booking.service?.name}</span>
                  </h4>
                  <p className="text-xs text-luxury-muted">
                    Phone: {booking.guest_phone} &bull; Email: {booking.guest_email} &bull; Paid: {formatNGN(booking.total_amount)}
                  </p>
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 justify-end w-full lg:w-auto">
                  {booking.status !== 'ATTENDED' && (
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => handleMarkAttended(booking.id)}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Mark Attended
                    </Button>
                  )}
                  {booking.status !== 'NO_SHOW' && booking.status !== 'ATTENDED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkNoShow(booking.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Mark No-Show
                    </Button>
                  )}
                  <Link to={`/booking/${booking.booking_reference}`} target="_blank">
                    <Button variant="outline-gold" size="sm">
                      Dossier
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Recent Bookings & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-luxury-border/60 pb-3">
            <h4 className="font-serif text-lg text-luxury-white">Recent Bookings</h4>
            <Link to="/admin/bookings" className="text-xs text-luxury-gold hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recent_bookings.map((b) => (
              <div
                key={b.id}
                className="bg-luxury-offblack border border-luxury-border/60 p-3.5 flex justify-between items-center text-xs"
              >
                <div>
                  <p className="font-semibold text-luxury-white">{b.guest_name}</p>
                  <p className="text-luxury-muted">{b.service?.name} &bull; {formatDate(b.booking_date)}</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge status={b.status} />
                  <p className="font-semibold text-luxury-gold">{formatNGN(b.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-luxury-card border border-luxury-border p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-luxury-border/60 pb-3">
            <h4 className="font-serif text-lg text-luxury-white">Recent Orders</h4>
            <Link to="/admin/orders" className="text-xs text-luxury-gold hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recent_orders.map((o) => (
              <div
                key={o.id}
                className="bg-luxury-offblack border border-luxury-border/60 p-3.5 flex justify-between items-center text-xs"
              >
                <div>
                  <p className="font-semibold text-luxury-white">{o.guest_name}</p>
                  <p className="text-luxury-muted">{o.order_reference} &bull; {o.items?.length || 0} item(s)</p>
                </div>
                <div className="text-right space-y-1">
                  <Badge status={o.status} />
                  <p className="font-semibold text-luxury-gold">{formatNGN(o.total_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
