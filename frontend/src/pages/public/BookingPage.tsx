import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Sparkles, ShoppingBag, User, Check, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Service, ServiceCategory, AvailabilityResult, TimeSlot, Product } from '../../types';
import { formatNGN } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/imageHelper';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { error, success } = useToast();

  // Wizard Steps: 1: Service, 2: Date & Time, 3: In-Session Products, 4: Client Info & Review
  const [step, setStep] = useState<number>(1);

  // Data states
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [sessionProducts, setSessionProducts] = useState<Product[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Date & Slot states
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Session product add-ons selection: map of productId -> quantity
  const [selectedAddons, setSelectedAddons] = useState<Record<number, number>>({});

  // Client form states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Pre-fill if authenticated
  useEffect(() => {
    if (user) {
      setGuestName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || user.profile?.phone || '');
      setGuestAddress(user.profile?.address || '');
    }
  }, [user]);

  // Load initial services & session products
  useEffect(() => {
    const initData = async () => {
      try {
        const [cats, servs, prods] = await Promise.all([
          api.services.getCategories(),
          api.services.list(),
          api.products.list({ session_product: true }),
        ]);
        setCategories(cats);
        setServices(servs);
        setSessionProducts(prods);

        // Pre-select service from URL param if present
        const serviceParam = searchParams.get('service');
        if (serviceParam) {
          const matched = servs.find((s) => s.id === parseInt(serviceParam, 10));
          if (matched) {
            setSelectedService(matched);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Failed to load booking catalog', err);
      }
    };
    initData();
  }, [searchParams]);

  // Fetch slots whenever service or date changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await api.availability.getSlots(selectedService.id, selectedDate);
        setAvailability(res);
      } catch (err: any) {
        error('Schedule Notice', err.message || 'Could not calculate availability for this date.');
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedService, selectedDate]);

  const toggleAddon = (product: Product) => {
    setSelectedAddons((prev) => {
      const current = prev[product.id] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }
      return { ...prev, [product.id]: 1 };
    });
  };

  const calculateAddonsTotal = () => {
    let total = 0;
    for (const [prodIdStr, qty] of Object.entries(selectedAddons)) {
      const prod = sessionProducts.find((p) => p.id === parseInt(prodIdStr, 10));
      if (prod) {
        total += Number(prod.effective_price || prod.price) * qty;
      }
    }
    return total;
  };

  const grandTotal = (selectedService ? Number(selectedService.price) : 0) + calculateAddonsTotal();

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedSlot) {
      error('Missing Selection', 'Please select a treatment and time slot.');
      return;
    }
    if (!guestName || !guestEmail || !guestPhone) {
      error('Incomplete Details', 'Full name, email, and phone number are required.');
      return;
    }

    setSubmitting(true);

    const payload = {
      service_id: selectedService.id,
      booking_date: selectedDate,
      start_time: selectedSlot.start_time,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      guest_address: guestAddress,
      customer_notes: customerNotes,
      session_products: Object.entries(selectedAddons).map(([prodId, qty]) => ({
        product_id: parseInt(prodId, 10),
        quantity: qty,
      })),
      callback_url: `${window.location.origin}/booking/verify`,
    };

    try {
      const result = await api.bookings.initiate(payload);

      // Check authorization url or direct confirmation
      const authUrl = result.payment?.authorization_url;
      if (authUrl && !result.payment?.skipped) {
        success('Reservation Hold Placed', 'Proceeding to secure Paystack transaction.');
        window.location.href = authUrl;
      } else {
        success('Booking Confirmed!', 'Your luxury appointment is confirmed. Confirmation email and QR token dispatched.');
        navigate(`/booking/${result.booking.booking_reference}`);
      }
    } catch (err: any) {
      error('Reservation Failed', err.message || 'Could not complete booking reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Bespoke Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal">
            Schedule Your Luxury Sanctuary
          </h1>
          <p className="text-xs text-luxury-muted font-light max-w-lg mx-auto leading-relaxed">
            Real-time availability &bull; Dedicated private suite &bull; Single-guest capacity guarantees
          </p>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="flex items-center justify-between max-w-2xl mx-auto border-b border-luxury-border/60 pb-6">
          {[
            { num: 1, label: '1. Treatment' },
            { num: 2, label: '2. Date & Time' },
            { num: 3, label: '3. In-Session Addons' },
            { num: 4, label: '4. Confirmation' },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                if (s.num === 1) setStep(1);
                else if (s.num === 2 && selectedService) setStep(2);
                else if (s.num === 3 && selectedService && selectedSlot) setStep(3);
                else if (s.num === 4 && selectedService && selectedSlot) setStep(4);
              }}
              className={`text-xs uppercase tracking-widest transition-colors ${
                step === s.num
                  ? 'text-luxury-gold font-semibold border-b-2 border-luxury-gold pb-1'
                  : step > s.num
                  ? 'text-luxury-white'
                  : 'text-luxury-darkmuted'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <h2 className="font-serif text-2xl font-normal text-luxury-white text-center">
              Select Your Luxury Treatment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className={`cursor-pointer bg-luxury-card p-6 border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-luxury-gold shadow-gold-subtle bg-luxury-offblack'
                        : 'border-luxury-border hover:border-luxury-gold/50'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
                          {service.category_name}
                        </span>
                        <span className="text-xs text-luxury-muted flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{service.duration_minutes} Mins</span>
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-medium text-luxury-white mt-1">
                        {service.name}
                      </h3>
                      <p className="text-xs text-luxury-muted mt-2 leading-relaxed">
                        {service.short_description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-luxury-border/60 flex items-center justify-between">
                      <span className="font-sans text-base font-semibold text-luxury-white">
                        {formatNGN(service.price)}
                      </span>
                      <Button variant={isSelected ? 'gold' : 'outline-gold'} size="sm">
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Date & Available Time Slot */}
        {step === 2 && selectedService && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-luxury-card border border-luxury-border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold">Selected Treatment</span>
                <h3 className="font-serif text-xl text-luxury-white">{selectedService.name}</h3>
                <p className="text-xs text-luxury-muted">{selectedService.duration_minutes} Mins &bull; {formatNGN(selectedService.price)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Change Treatment
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Date Selector */}
              <div className="md:col-span-5 bg-luxury-card border border-luxury-border p-6 space-y-4">
                <div className="flex items-center space-x-2 text-luxury-gold">
                  <CalendarIcon className="w-4 h-4" />
                  <h4 className="text-xs uppercase tracking-widest font-semibold">Select Appointment Date</h4>
                </div>
                <Input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-base font-medium"
                />
                <p className="text-[11px] text-luxury-muted">
                  Boutique is open Mon – Sat from 9:00 AM, Sun from 12:00 PM.
                </p>
              </div>

              {/* Real-time Time Slots Grid */}
              <div className="md:col-span-7 bg-luxury-card border border-luxury-border p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-luxury-gold">
                    <Clock className="w-4 h-4" />
                    <h4 className="text-xs uppercase tracking-widest font-semibold">Available Time Slots</h4>
                  </div>
                  {availability && (
                    <span className="text-[10px] uppercase tracking-widest text-luxury-muted">
                      {availability.slots?.length || 0} Slots Open
                    </span>
                  )}
                </div>

                {loadingSlots ? (
                  <div className="py-12 text-center text-luxury-muted space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-luxury-gold" />
                    <p className="text-xs">Computing live sanctuary availability...</p>
                  </div>
                ) : !availability?.is_open ? (
                  <div className="p-6 bg-luxury-offblack border border-luxury-border text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-luxury-gold mx-auto" />
                    <p className="font-serif text-sm text-luxury-white">Closed on Selected Date</p>
                    <p className="text-xs text-luxury-muted">{availability?.reason || 'Please select another date.'}</p>
                  </div>
                ) : availability.slots.length === 0 ? (
                  <div className="p-6 bg-luxury-offblack border border-luxury-border text-center space-y-2">
                    <Clock className="w-6 h-6 text-luxury-muted mx-auto" />
                    <p className="font-serif text-sm text-luxury-white">All Slots Fully Booked</p>
                    <p className="text-xs text-luxury-muted">Please select another date on the calendar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availability.slots.map((slot) => {
                      const isSelected = selectedSlot?.start_time === slot.start_time;
                      return (
                        <button
                          key={slot.start_time}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 text-center border transition-all duration-200 flex flex-col items-center justify-center space-y-1 ${
                            isSelected
                              ? 'bg-luxury-gold text-luxury-black border-luxury-gold font-bold shadow-gold-subtle scale-105'
                              : 'bg-luxury-offblack text-luxury-white border-luxury-border hover:border-luxury-gold/60'
                          }`}
                        >
                          <span className="text-xs font-semibold">{slot.start_time}</span>
                          <span className="text-[9px] uppercase tracking-wider opacity-80">
                            Until {slot.end_time}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-luxury-border">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                variant="gold"
                size="md"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to In-Session Addons
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: In-Session Product Addons */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
                Tailor Your Treatment
              </span>
              <h2 className="font-serif text-3xl font-normal">
                In-Session Formulation Add-ons
              </h2>
              <p className="text-xs text-luxury-muted">
                Select luxury elixirs and repair masks to be integrated into your treatment by your master stylist.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessionProducts.map((prod) => {
                const isSelected = !!selectedAddons[prod.id];
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleAddon(prod)}
                    className={`cursor-pointer bg-luxury-card p-6 border transition-all duration-300 flex space-x-4 items-center ${
                      isSelected
                        ? 'border-luxury-gold bg-luxury-offblack shadow-gold-subtle'
                        : 'border-luxury-border hover:border-luxury-gold/50'
                    }`}
                  >
                    <div className="w-16 h-16 bg-luxury-offblack border border-luxury-border flex-shrink-0 flex items-center justify-center p-2">
                      <img
                        src={getProductImageUrl(prod)}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', '/agamos-symbol.png');
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase tracking-widest text-luxury-gold font-medium">
                        {prod.category_name}
                      </span>
                      <h4 className="font-serif text-sm font-medium text-luxury-white truncate">
                        {prod.name}
                      </h4>
                      <p className="text-xs font-semibold text-luxury-gold mt-1">
                        +{formatNGN(prod.effective_price || prod.price)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-luxury-gold border-luxury-gold text-luxury-black'
                            : 'border-luxury-border'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-luxury-border">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
              <Button
                variant="gold"
                size="md"
                onClick={() => setStep(4)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Proceed to Client Details
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Client Details & Final Review */}
        {step === 4 && selectedService && selectedSlot && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Client Information Form */}
              <div className="lg:col-span-7 bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-6">
                <div className="flex items-center space-x-2 text-luxury-gold border-b border-luxury-border/60 pb-3">
                  <User className="w-4 h-4" />
                  <h3 className="text-xs uppercase tracking-widest font-semibold">
                    Guest & Booking Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    placeholder="e.g. Victoria Adeyemi"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="e.g. victoria@agamos.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number *"
                    placeholder="e.g. +234 801 234 5678"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    required
                  />
                  <Input
                    label="Residential Address"
                    placeholder="Optional address"
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
                    Special Requests or Texture Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Please specify any scalp sensitivities, hair length preferences, or allergy details..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold transition-colors"
                  />
                </div>
              </div>

              {/* Appointment Dossier & Paystack Summary */}
              <div className="lg:col-span-5 bg-luxury-card border border-luxury-gold/50 p-6 sm:p-8 space-y-6 shadow-2xl">
                <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
                  Appointment Dossier
                </span>

                <div className="space-y-3 pb-4 border-b border-luxury-border/60">
                  <h4 className="font-serif text-xl font-medium text-luxury-white">
                    {selectedService.name}
                  </h4>
                  <div className="text-xs text-luxury-muted space-y-1">
                    <p><strong>Date:</strong> {selectedDate}</p>
                    <p><strong>Time Slot:</strong> {selectedSlot.start_time} – {selectedSlot.end_time}</p>
                    <p><strong>Duration:</strong> {selectedService.duration_minutes} Mins</p>
                  </div>
                </div>

                {/* Pricing Line Items */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-luxury-muted">
                    <span>Treatment Fee</span>
                    <span className="text-luxury-white font-medium">{formatNGN(selectedService.price)}</span>
                  </div>
                  {calculateAddonsTotal() > 0 && (
                    <div className="flex justify-between text-luxury-muted">
                      <span>In-Session Formulations</span>
                      <span className="text-luxury-white font-medium">{formatNGN(calculateAddonsTotal())}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-luxury-border flex justify-between items-center text-sm font-semibold">
                    <span className="uppercase tracking-widest text-luxury-gold">Total Amount (NGN)</span>
                    <span className="text-base text-luxury-white">{formatNGN(grandTotal)}</span>
                  </div>
                </div>

                {/* Paystack Checkout Button */}
                <div className="pt-4 space-y-3">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full font-semibold"
                    isLoading={submitting}
                    onClick={handleBookingSubmit}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Confirm Appointment ({formatNGN(grandTotal)})
                  </Button>
                  <p className="text-[10px] text-center text-luxury-muted">
                    Instant Confirmation &bull; Secure QR Attendance Token dispatched via Email
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <Button variant="ghost" size="sm" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Add-ons
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
