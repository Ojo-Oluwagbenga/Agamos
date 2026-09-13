import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Filter, Plus, QrCode, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Booking, Service } from '../../types';
import { formatNGN, formatDate, formatTime12H } from '../../utils/formatters';
import { getQrCodeUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<Booking | null>(null);

  // Manual Booking Form
  const [manualServiceId, setManualServiceId] = useState<number>(0);
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('10:00');
  const [manualGuestName, setManualGuestName] = useState('');
  const [manualGuestEmail, setManualGuestEmail] = useState('');
  const [manualGuestPhone, setManualGuestPhone] = useState('');
  const [manualCreating, setManualCreating] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([
        api.admin.listBookings({
          status: statusFilter || undefined,
          date: dateFilter || undefined,
          search: searchQuery || undefined,
        }),
        api.services.list(),
      ]);
      setBookings(bRes);
      setServices(sRes);
      if (sRes.length > 0 && !manualServiceId) {
        setManualServiceId(sRes[0].id);
      }
    } catch (err: any) {
      error('Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, dateFilter, searchQuery]);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await api.admin.updateBooking(bookingId, { status });
      success('Status Updated', `Booking status changed to ${status}.`);
      loadData();
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualCreating(true);
    try {
      await api.bookings.initiate({
        service_id: manualServiceId,
        booking_date: manualDate,
        start_time: manualStartTime,
        guest_name: manualGuestName,
        guest_email: manualGuestEmail,
        guest_phone: manualGuestPhone,
        customer_notes: 'Manual in-salon concierge reservation',
      });
      success('Booking Created', 'Manual appointment successfully registered.');
      setManualModalOpen(false);
      setManualGuestName('');
      setManualGuestEmail('');
      setManualGuestPhone('');
      loadData();
    } catch (err: any) {
      error('Booking Failed', err.message);
    } finally {
      setManualCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-luxury-border pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Concierge Management
          </span>
          <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
            Appointments & Sanctuary Schedule
          </h1>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={() => setManualModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New In-Salon Booking
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-luxury-card border border-luxury-border p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-luxury-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest name, email, reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border pl-9 pr-3 py-2 text-xs outline-none focus:border-luxury-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-luxury-offblack text-luxury-white border border-luxury-border px-3 py-2 text-xs outline-none focus:border-luxury-gold"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-luxury-offblack text-luxury-white border border-luxury-border px-3 py-2 text-xs outline-none focus:border-luxury-gold"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PAID">PAID</option>
            <option value="ATTENDED">ATTENDED</option>
            <option value="PENDING">PENDING</option>
            <option value="NO_SHOW">NO_SHOW</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {(statusFilter || dateFilter || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter('');
                setDateFilter('');
                setSearchQuery('');
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-luxury-card border border-luxury-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-luxury-muted">
            <thead className="bg-luxury-offblack uppercase text-[10px] tracking-widest text-luxury-gold border-b border-luxury-border font-semibold">
              <tr>
                <th className="py-3.5 px-4">Ref & Guest</th>
                <th className="py-3.5 px-4">Treatment</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-luxury-muted">
                    Loading appointments...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-luxury-muted">
                    No appointments match the selected filters.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-luxury-offblack/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-luxury-gold font-semibold">{b.booking_reference}</p>
                      <p className="font-medium text-luxury-white text-xs">{b.guest_name}</p>
                      <p className="text-[10px] text-luxury-muted">{b.guest_phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-luxury-white">{b.service?.name}</p>
                      <p className="text-[10px] text-luxury-muted">{b.service?.duration_minutes} Mins</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-luxury-white">{formatDate(b.booking_date)}</p>
                      <p className="text-[10px] text-luxury-gold font-medium">
                        {formatTime12H(b.start_time)} – {formatTime12H(b.end_time)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-luxury-white">
                      {formatNGN(b.total_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={b.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedQR(b)}
                        className="p-1 text-luxury-gold hover:text-luxury-gold-light"
                        title="View QR Code"
                      >
                        <QrCode className="w-4 h-4 inline" />
                      </button>

                      {b.status !== 'ATTENDED' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'ATTENDED')}
                          className="px-2 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-semibold hover:bg-emerald-900"
                        >
                          Attended
                        </button>
                      )}

                      {b.status !== 'NO_SHOW' && b.status !== 'ATTENDED' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'NO_SHOW')}
                          className="px-2 py-1 bg-red-950/80 text-red-300 border border-red-500/40 text-[10px] uppercase font-semibold hover:bg-red-900"
                        >
                          No-Show
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Booking Creation Modal */}
      <Modal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Create In-Salon Appointment"
        subtitle="Reserve a slot manually on behalf of a guest"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateManualBooking} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
              Select Treatment *
            </label>
            <select
              value={manualServiceId}
              onChange={(e) => setManualServiceId(parseInt(e.target.value, 10))}
              className="w-full bg-luxury-offblack text-luxury-white border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold"
              required
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration_minutes} Mins - {formatNGN(s.price)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              type="date"
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              required
            />
            <Input
              label="Start Time *"
              type="time"
              value={manualStartTime}
              onChange={(e) => setManualStartTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Guest Name *"
              placeholder="e.g. Victoria Adeyemi"
              value={manualGuestName}
              onChange={(e) => setManualGuestName(e.target.value)}
              required
            />
            <Input
              label="Guest Email *"
              type="email"
              placeholder="e.g. victoria@agamos.com"
              value={manualGuestEmail}
              onChange={(e) => setManualGuestEmail(e.target.value)}
              required
            />
          </div>

          <Input
            label="Guest Phone *"
            placeholder="e.g. +234 801 234 5678"
            value={manualGuestPhone}
            onChange={(e) => setManualGuestPhone(e.target.value)}
            required
          />

          <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setManualModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" isLoading={manualCreating}>
              Confirm In-Salon Reservation
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Pass Modal */}
      {selectedQR && (
        <Modal
          isOpen={!!selectedQR}
          onClose={() => setSelectedQR(null)}
          title="Attendance QR Code"
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
          </div>
        </Modal>
      )}
    </div>
  );
};
