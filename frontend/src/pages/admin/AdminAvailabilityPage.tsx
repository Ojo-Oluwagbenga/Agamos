import React, { useEffect, useState } from 'react';
import { Clock, Calendar, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { BusinessHours, DateOverride, BlockedSlot } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminAvailabilityPage: React.FC = () => {
  const [weeklyHours, setWeeklyHours] = useState<BusinessHours[]>([]);
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Override Modal
  const [overrideModal, setOverrideModal] = useState(false);
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideOpenTime, setOverrideOpenTime] = useState('09:00');
  const [overrideCloseTime, setOverrideCloseTime] = useState('19:00');
  const [overrideIsClosed, setOverrideIsClosed] = useState(true);
  const [overrideReason, setOverrideReason] = useState('Public Holiday');

  // Blocked Slot Modal
  const [blockedModal, setBlockedModal] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockStartTime, setBlockStartTime] = useState('13:00');
  const [blockEndTime, setBlockEndTime] = useState('14:00');
  const [blockReason, setBlockReason] = useState('Stylist Sanitation Break');

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [wRes, oRes, bRes] = await Promise.all([
        api.availability.getWeeklyHours(),
        api.availability.getDateOverrides(),
        api.availability.getBlockedSlots(),
      ]);
      setWeeklyHours(wRes);
      setOverrides(oRes);
      setBlockedSlots(bRes);
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWeeklyHourChange = (idx: number, field: keyof BusinessHours, value: any) => {
    setWeeklyHours((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const saveWeeklyHours = async (hour: BusinessHours) => {
    try {
      await api.availability.updateBusinessHour(hour.id, hour);
      success('Hours Updated', `${hour.weekday_display} hours updated successfully.`);
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const handleCreateOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.availability.createDateOverride({
        date: overrideDate,
        is_closed: overrideIsClosed,
        open_time: overrideIsClosed ? null : overrideOpenTime,
        close_time: overrideIsClosed ? null : overrideCloseTime,
        reason: overrideReason,
      });
      success('Override Created', 'Date schedule override saved.');
      setOverrideModal(false);
      loadData();
    } catch (err: any) {
      error('Failed', err.message);
    }
  };

  const handleDeleteOverride = async (id: number) => {
    try {
      await api.availability.deleteDateOverride(id);
      success('Override Removed', 'Date returned to normal weekly schedule.');
      loadData();
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const handleCreateBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.availability.createBlockedSlot({
        date: blockDate,
        start_time: blockStartTime,
        end_time: blockEndTime,
        reason: blockReason,
      });
      success('Slot Blocked', 'Time slot blocked from online client booking.');
      setBlockedModal(false);
      loadData();
    } catch (err: any) {
      error('Failed', err.message);
    }
  };

  const handleDeleteBlockedSlot = async (id: number) => {
    try {
      await api.availability.deleteBlockedSlot(id);
      success('Block Lifted', 'Slot released back to availability engine.');
      loadData();
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="border-b border-luxury-border pb-6">
        <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
          Schedule & Concurrency Engine
        </span>
        <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
          Availability & Boutique Hours
        </h1>
      </div>

      {/* 1. Weekly Schedule Hours */}
      <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-luxury-border/60 pb-3">
          <div className="flex items-center space-x-2 text-luxury-gold">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">
              Weekly Standard Hours
            </h3>
          </div>
          <span className="text-[11px] text-luxury-muted">Automated concurrency slots</span>
        </div>

        <div className="space-y-3">
          {weeklyHours.map((hour, idx) => (
            <div
              key={hour.id}
              className="bg-luxury-offblack border border-luxury-border/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs"
            >
              <div className="w-28 font-serif text-sm font-semibold text-luxury-white">
                {hour.weekday_display}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hour.is_closed}
                    onChange={(e) => handleWeeklyHourChange(idx, 'is_closed', e.target.checked)}
                    className="accent-[#D4AF37]"
                  />
                  <span className="text-luxury-muted">Closed</span>
                </label>

                {!hour.is_closed && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={hour.open_time}
                      onChange={(e) => handleWeeklyHourChange(idx, 'open_time', e.target.value)}
                      className="bg-luxury-card border border-luxury-border text-luxury-white px-2 py-1 outline-none focus:border-luxury-gold"
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={hour.close_time}
                      onChange={(e) => handleWeeklyHourChange(idx, 'close_time', e.target.value)}
                      className="bg-luxury-card border border-luxury-border text-luxury-white px-2 py-1 outline-none focus:border-luxury-gold"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-luxury-muted">
                  <span>Capacity:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={hour.max_concurrent_capacity}
                    onChange={(e) =>
                      handleWeeklyHourChange(idx, 'max_concurrent_capacity', parseInt(e.target.value, 10))
                    }
                    className="w-12 bg-luxury-card border border-luxury-border text-luxury-white px-2 py-1 text-center outline-none focus:border-luxury-gold"
                  />
                </div>
                <Button variant="outline-gold" size="sm" onClick={() => saveWeeklyHours(hour)}>
                  Save
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Date Overrides & Closures */}
      <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-luxury-border/60 pb-3">
          <div className="flex items-center space-x-2 text-luxury-gold">
            <Calendar className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">
              Date Closures & Special Overrides ({overrides.length})
            </h3>
          </div>
          <Button variant="gold" size="sm" onClick={() => setOverrideModal(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Date Override
          </Button>
        </div>

        {overrides.length === 0 ? (
          <p className="text-xs text-luxury-muted py-4 text-center">No specific date overrides configured.</p>
        ) : (
          <div className="space-y-3">
            {overrides.map((ov) => (
              <div
                key={ov.id}
                className="bg-luxury-offblack border border-luxury-border/60 p-4 flex justify-between items-center text-xs"
              >
                <div>
                  <p className="font-semibold text-luxury-white">{ov.date} &bull; {ov.reason}</p>
                  <p className="text-luxury-muted">
                    {ov.is_closed ? 'Boutique Closed Entire Day' : `Special Hours: ${ov.open_time} - ${ov.close_time}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteOverride(ov.id)}
                  className="text-luxury-muted hover:text-red-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Blocked Time Slots */}
      <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-luxury-border/60 pb-3">
          <div className="flex items-center space-x-2 text-luxury-gold">
            <Clock className="w-4 h-4" />
            <h3 className="text-xs uppercase tracking-widest font-semibold">
              Custom Blocked Time Slots ({blockedSlots.length})
            </h3>
          </div>
          <Button variant="gold" size="sm" onClick={() => setBlockedModal(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Block Time Slot
          </Button>
        </div>

        {blockedSlots.length === 0 ? (
          <p className="text-xs text-luxury-muted py-4 text-center">No individual blocked time slots.</p>
        ) : (
          <div className="space-y-3">
            {blockedSlots.map((bs) => (
              <div
                key={bs.id}
                className="bg-luxury-offblack border border-luxury-border/60 p-4 flex justify-between items-center text-xs"
              >
                <div>
                  <p className="font-semibold text-luxury-white">
                    {bs.date} &bull; {bs.start_time} – {bs.end_time}
                  </p>
                  <p className="text-luxury-muted">{bs.reason}</p>
                </div>
                <button
                  onClick={() => handleDeleteBlockedSlot(bs.id)}
                  className="text-luxury-muted hover:text-red-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date Override Modal */}
      <Modal isOpen={overrideModal} onClose={() => setOverrideModal(false)} title="Add Date Schedule Override" maxWidth="md">
        <form onSubmit={handleCreateOverride} className="space-y-4">
          <Input label="Date *" type="date" value={overrideDate} onChange={(e) => setOverrideDate(e.target.value)} required />
          <Input label="Reason / Holiday Name *" placeholder="e.g. Independence Day Gala" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} required />

          <label className="flex items-center space-x-2 text-xs text-luxury-white cursor-pointer pt-1">
            <input type="checkbox" checked={overrideIsClosed} onChange={(e) => setOverrideIsClosed(e.target.checked)} className="accent-[#D4AF37]" />
            <span>Mark Entire Boutique Closed on this Date</span>
          </label>

          {!overrideIsClosed && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Special Open Time" type="time" value={overrideOpenTime} onChange={(e) => setOverrideOpenTime(e.target.value)} />
              <Input label="Special Close Time" type="time" value={overrideCloseTime} onChange={(e) => setOverrideCloseTime(e.target.value)} />
            </div>
          )}

          <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setOverrideModal(false)}>Cancel</Button>
            <Button variant="gold" size="md" type="submit">Save Override</Button>
          </div>
        </form>
      </Modal>

      {/* Block Slot Modal */}
      <Modal isOpen={blockedModal} onClose={() => setBlockedModal(false)} title="Block Sanctuary Time Slot" maxWidth="md">
        <form onSubmit={handleCreateBlockedSlot} className="space-y-4">
          <Input label="Date *" type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time *" type="time" value={blockStartTime} onChange={(e) => setBlockStartTime(e.target.value)} required />
            <Input label="End Time *" type="time" value={blockEndTime} onChange={(e) => setBlockEndTime(e.target.value)} required />
          </div>
          <Input label="Reason *" placeholder="e.g. Private VIP Suite Maintenance" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} required />

          <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setBlockedModal(false)}>Cancel</Button>
            <Button variant="gold" size="md" type="submit">Block Slot</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
