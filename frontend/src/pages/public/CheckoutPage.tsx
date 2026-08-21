import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Truck, Store, ArrowRight, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { formatNGN } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [flatDeliveryFee, setFlatDeliveryFee] = useState<number>(3500);

  // Form fields
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('Lagos');
  const [shippingState, setShippingState] = useState('Lagos State');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Pre-fill if logged in
    if (user) {
      setGuestName(`${user.first_name || ''} ${user.last_name || ''}`.trim());
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || user.profile?.phone || '');
      setGuestAddressIfAny(user.profile?.address || '');
    }

    // Fetch site delivery fee
    const loadSettings = async () => {
      try {
        const cms = await api.cms.getOverview();
        if (cms.settings?.delivery_flat_fee) {
          setFlatDeliveryFee(Number(cms.settings.delivery_flat_fee));
        }
      } catch {
        // default 3500
      }
    };
    loadSettings();
  }, [user]);

  const setGuestAddressIfAny = (addr: string) => {
    if (addr) setShippingAddress(addr);
  };

  if (items.length === 0) {
    return (
      <div className="bg-luxury-black text-luxury-white min-h-screen pt-36 pb-24 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-md mx-auto bg-luxury-card border border-luxury-border p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-luxury-muted mx-auto" />
          <h2 className="font-serif text-2xl">Your Bag is Empty</h2>
          <p className="text-xs text-luxury-muted">Please add products to proceed with checkout.</p>
          <Link to="/shop">
            <Button variant="gold" size="sm">
              Explore Beauty Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentDeliveryFee = deliveryType === 'DELIVERY' ? flatDeliveryFee : 0;
  const grandTotal = subtotal + currentDeliveryFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName || !guestEmail || !guestPhone) {
      error('Incomplete Details', 'Please complete all customer contact fields.');
      return;
    }

    if (deliveryType === 'DELIVERY' && !shippingAddress) {
      error('Missing Address', 'Please provide a destination shipping address.');
      return;
    }

    setSubmitting(true);

    const payload = {
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      delivery_type: deliveryType,
      shipping_address: shippingAddress,
      shipping_city: shippingCity,
      shipping_state: shippingState,
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
      callback_url: `${window.location.origin}/order/verify`,
    };

    try {
      const result = await api.orders.checkout(payload);
      success('Order Created', 'Redirecting to secure Paystack payment gateway.');

      const authUrl = result.payment?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        navigate(`/order/${result.order.order_reference}`);
      }
    } catch (err: any) {
      error('Checkout Failed', err.message || 'Could not complete checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="border-b border-luxury-border pb-6">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Bespoke Fulfillment
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal mt-1">
            Secure Checkout
          </h1>
        </div>

        <form onSubmit={handleCheckoutSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Checkout Inputs */}
            <div className="lg:col-span-7 space-y-8">
              {/* 1. Fulfillment Method Selection */}
              <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-white border-b border-luxury-border/60 pb-3">
                  1. Fulfillment Method
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div
                    onClick={() => setDeliveryType('PICKUP')}
                    className={`cursor-pointer p-4 border transition-all ${
                      deliveryType === 'PICKUP'
                        ? 'border-luxury-gold bg-luxury-offblack shadow-gold-subtle'
                        : 'border-luxury-border bg-luxury-offblack/40 hover:border-luxury-gold/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Store className="w-5 h-5 text-luxury-gold" />
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-luxury-white">
                          Store Pickup
                        </h4>
                        <p className="text-[10px] text-luxury-muted mt-0.5">Victoria Island Flagship &bull; Free</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setDeliveryType('DELIVERY')}
                    className={`cursor-pointer p-4 border transition-all ${
                      deliveryType === 'DELIVERY'
                        ? 'border-luxury-gold bg-luxury-offblack shadow-gold-subtle'
                        : 'border-luxury-border bg-luxury-offblack/40 hover:border-luxury-gold/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-luxury-gold" />
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-semibold text-luxury-white">
                          Courier Delivery
                        </h4>
                        <p className="text-[10px] text-luxury-muted mt-0.5">Nationwide &bull; +{formatNGN(flatDeliveryFee)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Customer Contact */}
              <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-white border-b border-luxury-border/60 pb-3">
                  2. Customer Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Full Name *"
                    placeholder="Victoria Adeyemi"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="victoria@agamos.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Phone Number *"
                  placeholder="+234 801 234 5678"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                />
              </div>

              {/* 3. Shipping Address (If Delivery) */}
              {deliveryType === 'DELIVERY' && (
                <div className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-4 animate-slide-up">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-white border-b border-luxury-border/60 pb-3">
                    3. Destination Address
                  </h3>
                  <Input
                    label="Street Address *"
                    placeholder="e.g. 4 Banana Island Road, Ikoyi"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City *"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                    />
                    <Input
                      label="State *"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Order Summary & Paystack Pay */}
            <div className="lg:col-span-5 bg-luxury-card border border-luxury-gold/50 p-6 sm:p-8 space-y-6 shadow-2xl">
              <h3 className="font-serif text-xl font-normal text-luxury-white border-b border-luxury-border/60 pb-3">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 divide-y divide-luxury-border/40">
                {items.map((i) => (
                  <div key={i.product.id} className="pt-3 first:pt-0 flex justify-between text-xs">
                    <div>
                      <p className="font-medium text-luxury-white">{i.product.name}</p>
                      <p className="text-luxury-muted">Qty: {i.quantity}</p>
                    </div>
                    <span className="font-medium text-luxury-white">{formatNGN(i.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-2 text-xs pt-4 border-t border-luxury-border/60">
                <div className="flex justify-between text-luxury-muted">
                  <span>Subtotal</span>
                  <span className="text-luxury-white">{formatNGN(subtotal)}</span>
                </div>
                <div className="flex justify-between text-luxury-muted">
                  <span>Fulfillment ({deliveryType === 'PICKUP' ? 'Store Pickup' : 'Courier Delivery'})</span>
                  <span className="text-luxury-white">
                    {deliveryType === 'PICKUP' ? 'FREE' : formatNGN(flatDeliveryFee)}
                  </span>
                </div>
                <div className="pt-3 border-t border-luxury-border flex justify-between items-center text-sm font-semibold">
                  <span className="uppercase tracking-widest text-luxury-gold">Total Amount (NGN)</span>
                  <span className="text-base text-luxury-white">{formatNGN(grandTotal)}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  className="w-full font-semibold"
                  isLoading={submitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Pay with Paystack ({formatNGN(grandTotal)})
                </Button>
                <div className="flex items-center justify-center space-x-2 text-[10px] text-luxury-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>256-Bit Encrypted Paystack Transaction</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
