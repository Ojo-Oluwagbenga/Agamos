import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Truck, Store, ArrowRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { Order } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatNGN, formatDate } from '../../utils/formatters';
import { getQrCodeUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const OrderConfirmationPage: React.FC = () => {
  const { id: referenceParam } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const loadOrder = async () => {
      const initialRef = referenceParam || searchParams.get('reference') || searchParams.get('trxref');
      if (!initialRef) {
        setErrorMsg('No order reference provided.');
        setLoading(false);
        return;
      }

      try {
        let orderRefToFetch = initialRef;
        const trxRef = searchParams.get('reference') || searchParams.get('trxref');

        if (trxRef) {
          try {
            const verifyRes = await api.payments.verify(trxRef);
            if (verifyRes?.order_reference) {
              orderRefToFetch = verifyRes.order_reference;
            }
          } catch (e) {
            console.warn('Payment verify verification error:', e);
          }
        }

        const data = await api.orders.getByRef(orderRefToFetch);
        setOrder(data);

        // Clear bag only after order record is confirmed
        clearCart();

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F5D77F', '#FFFFFF'],
        });
      } catch (err: any) {
        setErrorMsg(err.message || 'Could not find order record.');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [referenceParam, searchParams]);

  if (loading) {
    return (
      <div className="bg-luxury-black min-h-screen pt-36 pb-20 flex flex-col justify-center items-center text-luxury-white space-y-4">
        <div className="w-12 h-12 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-luxury-muted">Verifying order status...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="bg-luxury-black min-h-screen pt-36 pb-20 text-center text-luxury-white px-4">
        <div className="max-w-md mx-auto bg-luxury-card border border-luxury-border p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="font-serif text-2xl">Order Not Found</h2>
          <p className="text-xs text-luxury-muted">{errorMsg || 'Please verify your order reference number.'}</p>
          <Link to="/shop">
            <Button variant="outline-gold" size="sm">
              Return to Beauty Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const qrFallbackUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=AGAMOS:ORDER:${order.order_reference}`;
  const qrImageUrl = getQrCodeUrl(null, order.order_reference, 'ORDER');

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-luxury-offblack border border-luxury-gold rounded-full flex items-center justify-center mx-auto mb-2 shadow-gold-glow">
            <CheckCircle2 className="w-8 h-8 text-luxury-gold" />
          </div>
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Order Confirmed & Paid
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal">
            Thank You For Your Order
          </h1>
          <p className="text-xs text-luxury-muted font-light max-w-lg mx-auto leading-relaxed">
            Your receipt has been sent to{' '}
            <span className="text-luxury-white font-medium">{order.guest_email}</span>.
          </p>
        </div>

        {/* Order Dossier Card */}
        <div className="bg-luxury-card border border-luxury-border overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-luxury-card via-luxury-gold/20 to-luxury-card p-4 border-b border-luxury-border flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="font-serif text-base tracking-widest text-luxury-gold">
              ORDER REFERENCE: {order.order_reference}
            </span>
            <Badge status={order.status} />
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left QR Code Order Verification Pass */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-luxury-offblack border border-luxury-gold/40 text-center space-y-4 shadow-gold-subtle">
              <div className="bg-white p-3 shadow-md">
                <img
                  src={qrImageUrl}
                  alt={`Order QR code for ${order.order_reference}`}
                  className="w-44 h-44 object-contain"
                  onError={(e) => {
                    if (e.currentTarget.src !== qrFallbackUrl) {
                      e.currentTarget.src = qrFallbackUrl;
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-luxury-gold block">
                  Order Verification QR
                </span>
                <p className="text-[10px] text-luxury-muted max-w-[200px] leading-tight">
                  Present this digital QR pass for flagship store pickup check-in or courier receipt verification.
                </p>
              </div>
            </div>

            {/* Right: Fulfillment & Items & Financials */}
            <div className="md:col-span-7 space-y-6">
              {/* Fulfillment Status Banner */}
              <div className="bg-luxury-offblack border border-luxury-border p-4 flex items-center space-x-3">
                {order.delivery_type === 'PICKUP' ? (
                  <Store className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                ) : (
                  <Truck className="w-5 h-5 text-luxury-gold flex-shrink-0" />
                )}
                <div className="text-xs">
                  <p className="font-semibold text-luxury-white">
                    Fulfillment Method: {order.delivery_type_display}
                  </p>
                  <p className="text-luxury-muted mt-0.5">
                    {order.delivery_type === 'PICKUP'
                      ? 'Your parcel will be packaged in our Victoria Island flagship suite.'
                      : `Dispatched to: ${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state}`}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
                  Purchased Formulations
                </h4>
                <div className="divide-y divide-luxury-border/60">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-medium text-luxury-white">{item.product_name}</p>
                        <p className="text-luxury-muted">SKU: {item.sku} &bull; Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-luxury-white">{formatNGN(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials Summary */}
              <div className="pt-4 border-t border-luxury-border/60 space-y-2 text-xs">
                <div className="flex justify-between text-luxury-muted">
                  <span>Subtotal</span>
                  <span>{formatNGN(order.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between text-luxury-muted">
                  <span>Delivery Fee</span>
                  <span>{Number(order.delivery_fee) > 0 ? formatNGN(order.delivery_fee) : 'FREE'}</span>
                </div>
                <div className="pt-3 border-t border-luxury-border flex justify-between items-center text-sm font-semibold">
                  <span className="uppercase tracking-widest text-luxury-gold">Total Amount Paid</span>
                  <span className="text-base text-luxury-white">{formatNGN(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <Link to="/shop" className="w-full sm:w-auto">
            <Button variant="outline-gold" size="md" className="w-full">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/account/orders" className="w-full sm:w-auto">
            <Button variant="gold" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View in Client Sanctuary
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
