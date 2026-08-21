import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatNGN } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/imageHelper';
import { Button } from '../ui/Button';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, itemCount, subtotal, updateQuantity, removeFromCart } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-luxury-offblack border-l border-luxury-border flex flex-col shadow-2xl animate-slide-up">
          {/* Header */}
          <div className="p-6 border-b border-luxury-border flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5 text-luxury-gold" />
              <h2 className="font-serif text-xl font-semibold tracking-wide text-luxury-white">
                SHOPPING BAG ({itemCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-luxury-muted hover:text-luxury-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-luxury-border/40">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-16 h-16 text-luxury-darkmuted stroke-1 mb-4" />
                <p className="font-serif text-lg text-luxury-white mb-2">Your Bag is Empty</p>
                <p className="text-xs text-luxury-muted mb-6 max-w-xs leading-relaxed">
                  Discover our bespoke collection of luxury hair elixirs, 24K gold face serums, and spa rituals.
                </p>
                <Button
                  variant="outline-gold"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                >
                  <Link to="/shop">Explore Beauty Store</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const primaryImage = getProductImageUrl(item.product);

                return (
                  <div key={item.product.id} className="pt-6 first:pt-0 flex space-x-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-luxury-card border border-luxury-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', '/agamos-symbol.png');
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm font-medium text-luxury-white leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-luxury-muted hover:text-red-400 transition-colors ml-2"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-luxury-gold font-medium mt-1">
                          {formatNGN(item.product.effective_price || item.product.price)}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center border border-luxury-border bg-luxury-card">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 text-luxury-muted hover:text-luxury-white transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-medium text-luxury-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 text-luxury-muted hover:text-luxury-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-luxury-white">
                          {formatNGN(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-luxury-border bg-luxury-card/50 space-y-4">
              <div className="flex justify-between text-xs uppercase tracking-widest text-luxury-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-luxury-white text-sm">{formatNGN(subtotal)}</span>
              </div>
              <p className="text-[11px] text-luxury-muted">
                Shipping and pickup preferences calculated at checkout.
              </p>
              <div className="space-y-2 pt-2">
                <Link to="/checkout" onClick={() => setIsCartOpen(false)} className="block w-full">
                  <Button variant="gold" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Proceed to Checkout
                  </Button>
                </Link>
                <Link to="/cart" onClick={() => setIsCartOpen(false)} className="block w-full">
                  <Button variant="ghost" size="sm" className="w-full text-luxury-muted hover:text-luxury-white">
                    View Full Cart Page
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
