import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatNGN } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';

export const CartPage: React.FC = () => {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-luxury-black text-luxury-white min-h-screen pt-36 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-6 bg-luxury-card border border-luxury-border p-12 shadow-2xl">
          <ShoppingBag className="w-16 h-16 text-luxury-darkmuted mx-auto stroke-1" />
          <h1 className="font-serif text-3xl font-normal">Your Shopping Bag is Empty</h1>
          <p className="text-xs text-luxury-muted leading-relaxed max-w-sm mx-auto">
            Explore our curated boutique of 24K gold cellular elixirs, organic restorative masks, and spa aromatics.
          </p>
          <div className="pt-4">
            <Link to="/shop">
              <Button variant="gold" size="md">
                Browse Beauty Store
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-luxury-border pb-6 gap-4">
          <div>
            <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
              Order Review
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal mt-1">
              Your Shopping Bag ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-xs uppercase tracking-widest text-luxury-muted hover:text-red-400 transition-colors"
          >
            Clear Entire Bag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => {
              const primaryImage = getProductImageUrl(item.product);

              return (
                <div
                  key={item.product.id}
                  className="bg-luxury-card border border-luxury-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                  {/* Thumbnail & Name */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-20 h-20 bg-luxury-offblack border border-luxury-border flex-shrink-0 flex items-center justify-center p-2">
                      <img
                        src={primaryImage}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', '/agamos-symbol.png');
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium">
                        {item.product.category_name}
                      </span>
                      <h3 className="font-serif text-base font-medium text-luxury-white">
                        <Link to={`/shop/${item.product.slug}`} className="hover:text-luxury-gold transition-colors">
                          {item.product.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-luxury-muted">
                        Unit Price: {formatNGN(item.product.effective_price || item.product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto">
                    <div className="inline-flex items-center border border-luxury-border bg-luxury-offblack">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 text-luxury-muted hover:text-luxury-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-luxury-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 text-luxury-muted hover:text-luxury-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-sans text-sm font-semibold text-luxury-white min-w-[90px] text-right">
                      {formatNGN(item.subtotal)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-luxury-muted hover:text-red-400 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-luxury-gold hover:underline pt-2 font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Continue Exploring Formulations</span>
            </Link>
          </div>

          {/* Order Summary & Checkout Box */}
          <div className="lg:col-span-4 bg-luxury-card border border-luxury-gold/50 p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="font-serif text-xl font-normal text-luxury-white border-b border-luxury-border/60 pb-3">
              Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-luxury-muted">
                <span>Bag Subtotal</span>
                <span className="text-luxury-white font-medium">{formatNGN(subtotal)}</span>
              </div>
              <div className="flex justify-between text-luxury-muted">
                <span>Shipping / Courier</span>
                <span className="text-luxury-muted">Calculated next step</span>
              </div>
              <div className="pt-4 border-t border-luxury-border flex justify-between items-center text-sm font-semibold">
                <span className="uppercase tracking-widest text-luxury-gold">Subtotal (NGN)</span>
                <span className="text-base text-luxury-white">{formatNGN(subtotal)}</span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <Link to="/checkout" className="block w-full">
                <Button variant="gold" size="lg" className="w-full font-semibold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Proceed to Checkout
                </Button>
              </Link>
              <p className="text-[10px] text-center text-luxury-muted">
                Secure Paystack Payment &bull; Nationwide Courier or Flagship Pickup
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
