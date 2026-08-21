import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Filter, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Product, ProductCategory } from '../../types';
import { formatNGN } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

export const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setSelectedCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          api.products.getCategories(),
          api.products.list({
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            search: searchQuery || undefined,
          }),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="bg-luxury-black text-luxury-white min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs uppercase font-sans tracking-ultra-wide text-luxury-gold">
            Haute Apothecary
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal">
            The AGAMOS Beauty Store
          </h1>
          <p className="text-sm text-luxury-muted font-light leading-relaxed">
            Formulated in small artisanal batches. Enriched with pure 24K gold, green caviar, and wild-harvested botanical oils.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-luxury-border">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-colors border ${
                selectedCategory === 'all'
                  ? 'bg-luxury-gold text-luxury-black border-luxury-gold font-semibold'
                  : 'bg-luxury-offblack text-luxury-muted border-luxury-border hover:border-luxury-gold hover:text-luxury-white'
              }`}
            >
              All Formulations
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-widest font-medium transition-colors border ${
                  selectedCategory === cat.slug
                    ? 'bg-luxury-gold text-luxury-black border-luxury-gold font-semibold'
                    : 'bg-luxury-offblack text-luxury-muted border-luxury-border hover:border-luxury-gold hover:text-luxury-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-luxury-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search formulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border pl-10 pr-4 py-2.5 text-xs outline-none focus:border-luxury-gold transition-colors"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-luxury-card border border-luxury-border p-6 h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-luxury-card border border-luxury-border">
            <Sparkles className="w-10 h-10 text-luxury-darkmuted mx-auto mb-3" />
            <p className="font-serif text-xl text-luxury-white">No Formulations Found</p>
            <p className="text-xs text-luxury-muted mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const primaryImage = getProductImageUrl(product);

              return (
                <div
                  key={product.id}
                  className="group bg-luxury-card border border-luxury-border flex flex-col justify-between transition-all duration-300 hover:border-luxury-gold/60 hover:shadow-2xl overflow-hidden"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square bg-luxury-offblack overflow-hidden flex items-center justify-center p-6">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute('src', '/agamos-symbol.png');
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-luxury-black/90 px-2.5 py-1 text-[9px] uppercase tracking-widest text-luxury-gold border border-luxury-gold/30">
                      {product.category_name}
                    </div>
                    {product.stock_quantity <= 0 ? (
                      <div className="absolute top-4 right-4 bg-red-950/90 text-red-300 px-2.5 py-1 text-[9px] uppercase tracking-widest border border-red-500/40">
                        Out of Stock
                      </div>
                    ) : product.is_low_stock ? (
                      <div className="absolute top-4 right-4 bg-amber-950/90 text-amber-300 px-2.5 py-1 text-[9px] uppercase tracking-widest border border-amber-500/40">
                        Only {product.stock_quantity} Left
                      </div>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-luxury-white group-hover:text-luxury-gold transition-colors leading-snug">
                        <Link to={`/shop/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <p className="text-xs text-luxury-muted mt-1.5 line-clamp-2 leading-relaxed">
                        {product.short_description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-luxury-border/60 flex items-center justify-between">
                      <div>
                        <span className="font-sans text-base font-semibold text-luxury-white">
                          {formatNGN(product.effective_price || product.price)}
                        </span>
                        {product.sale_price && (
                          <span className="text-xs text-luxury-muted line-through ml-2">
                            {formatNGN(product.price)}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="gold"
                        size="sm"
                        disabled={product.stock_quantity <= 0}
                        onClick={() => addToCart(product, 1)}
                        leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                      >
                        {product.stock_quantity <= 0 ? 'Sold Out' : 'Add to Bag'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
