import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Check, Plus, Minus, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { formatNGN } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        const data = await api.products.getBySlug(slug);
        setProduct(data);
        const primary = getProductImageUrl(data);
        setSelectedImage(primary);
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-luxury-black min-h-screen pt-36 pb-20 flex justify-center items-center">
        <div className="w-12 h-12 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-luxury-black min-h-screen pt-36 pb-20 text-center text-luxury-white px-4">
        <h2 className="font-serif text-3xl mb-4">Product Not Found</h2>
        <Button variant="outline-gold" onClick={() => navigate('/shop')}>
          Back to Beauty Store
        </Button>
      </div>
    );
  }

  const handleAddAndCheckout = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Breadcrumb Back */}
        <Link
          to="/shop"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-luxury-muted hover:text-luxury-gold transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Beauty Store</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Gallery / Images */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square bg-luxury-card border border-luxury-border flex items-center justify-center p-10 overflow-hidden shadow-2xl">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', '/agamos-symbol.png');
                }}
              />
              <div className="absolute top-4 left-4 bg-luxury-black/90 px-3 py-1 text-[10px] uppercase tracking-widest text-luxury-gold border border-luxury-gold/30">
                {product.category_name}
              </div>
            </div>

            {/* Thumbnails row if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.image)}
                    className={`w-20 h-20 bg-luxury-card border p-2 flex-shrink-0 transition-all ${
                      selectedImage === img.image ? 'border-luxury-gold' : 'border-luxury-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image} alt={img.alt_text || ''} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Dossier & Purchase Box */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
                  SKU: {product.sku}
                </span>
                {product.stock_quantity > 0 ? (
                  <span className="text-[11px] text-emerald-400 font-medium">In Stock ({product.stock_quantity} available)</span>
                ) : (
                  <span className="text-[11px] text-red-400 font-medium">Currently Sold Out</span>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center space-x-3 pt-2">
                <span className="font-sans text-2xl font-semibold text-luxury-white">
                  {formatNGN(product.effective_price || product.price)}
                </span>
                {product.sale_price && (
                  <span className="text-sm text-luxury-muted line-through">
                    {formatNGN(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3 pt-4 border-t border-luxury-border/60">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-luxury-white">
                Formulation Breakdown
              </h3>
              <p className="text-sm text-luxury-muted font-light leading-relaxed whitespace-pre-line">
                {product.description || product.short_description}
              </p>
            </div>

            {/* Quantity and Actions */}
            {product.stock_quantity > 0 && (
              <div className="pt-6 border-t border-luxury-border space-y-6">
                <div className="flex items-center space-x-4">
                  <span className="text-xs uppercase tracking-widest text-luxury-muted font-medium">Quantity</span>
                  <div className="inline-flex items-center border border-luxury-border bg-luxury-card">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-luxury-muted hover:text-luxury-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-luxury-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                      className="p-2 text-luxury-muted hover:text-luxury-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="gold"
                    size="lg"
                    className="flex-1"
                    onClick={handleAddAndCheckout}
                    leftIcon={<ShoppingBag className="w-4 h-4" />}
                  >
                    Add to Bag ({formatNGN(Number(product.effective_price || product.price) * quantity)})
                  </Button>
                </div>
              </div>
            )}

            {/* Guarantee Note */}
            <div className="bg-luxury-offblack border border-luxury-border/60 p-4 flex items-center space-x-3 text-xs text-luxury-muted">
              <ShieldCheck className="w-5 h-5 text-luxury-gold flex-shrink-0" />
              <span>100% Authentic Luxury Formulation &bull; Victoria Island Store Pickup or Nationwide Courier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
