import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Package, Search, Sparkles, Image as ImageIcon, Upload, Trash2, CheckCircle2, X } from 'lucide-react';
import { api } from '../../services/api';
import { Product, ProductCategory } from '../../types';
import { formatNGN } from '../../utils/formatters';
import { getProductImageUrl } from '../../utils/imageHelper';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [price, setPrice] = useState('15000');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState(20);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [shortDescription, setShortDescription] = useState('Luxury Hair & Body Formulation');
  const [description, setDescription] = useState('Handcrafted with pure botanical elixirs, organic oils, and 24K gold infusions.');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSessionProduct, setIsSessionProduct] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        api.products.getCategories(),
        api.products.list(),
      ]);
      setCategories(cats);
      setProducts(prods);
      if (cats.length > 0 && (!categoryId || categoryId === 0)) {
        setCategoryId(cats[0].id);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`AGM-PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategoryId(categories.length > 0 ? categories[0].id : 1);
    setPrice('15000');
    setSalePrice('');
    setStockQuantity(20);
    setLowStockThreshold(5);
    setShortDescription('Luxury Hair & Body Formulation');
    setDescription('Handcrafted with pure botanical elixirs, organic oils, and 24K gold infusions.');
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
    setIsSessionProduct(true);
    setIsFeatured(false);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.category || (categories[0]?.id || 1));
    setPrice(String(p.price));
    setSalePrice(p.sale_price ? String(p.sale_price) : '');
    setStockQuantity(p.stock_quantity);
    setLowStockThreshold(p.low_stock_threshold);
    setShortDescription(p.short_description || 'Luxury Hair & Body Formulation');
    setDescription(p.description || 'Handcrafted with pure botanical elixirs, organic oils, and 24K gold infusions.');
    
    const existingImg = getProductImageUrl(p, '');
    setImageUrl(existingImg);
    setImageFile(null);
    setImagePreview(existingImg || null);

    setIsSessionProduct(p.is_session_product);
    setIsFeatured(p.is_featured);
    setIsActive(p.is_active);
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const targetCategory = categoryId || (categories.length > 0 ? categories[0].id : 1);

    // Single multipart FormData payload
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('sku', sku.trim() || `AGM-PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    formData.append('category', String(targetCategory));
    formData.append('price', String(price));
    if (salePrice) {
      formData.append('sale_price', String(salePrice));
    }
    formData.append('stock_quantity', String(stockQuantity));
    formData.append('low_stock_threshold', String(lowStockThreshold));
    formData.append('short_description', shortDescription.trim() || 'Luxury Formulation');
    formData.append('description', description.trim() || 'Bespoke formulation.');
    formData.append('is_session_product', isSessionProduct ? 'true' : 'false');
    formData.append('is_featured', isFeatured ? 'true' : 'false');
    formData.append('is_active', isActive ? 'true' : 'false');

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imageUrl) {
      formData.append('image_url', imageUrl.trim());
    }

    try {
      if (editingProduct) {
        await api.admin.updateProduct(editingProduct.id, formData);
        success('Product Updated', `${name} has been updated.`);
      } else {
        await api.admin.createProduct(formData);
        success('Product Created', `${name} formulation added to catalog.`);
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed to Save', err.message || 'Could not save product formulation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-luxury-border pb-6">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
            Cosmetics & Formulations
          </h1>
        </div>
        <Button variant="gold" size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Formulation
        </Button>
      </div>

      <div className="bg-luxury-card border border-luxury-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-luxury-muted">
            <thead className="bg-luxury-offblack uppercase text-[10px] tracking-widest text-luxury-gold border-b border-luxury-border font-semibold">
              <tr>
                <th className="py-3.5 px-4">Item & Image</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Add-on / Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/60">
              {products.map((p) => {
                const prodImg = getProductImageUrl(p, '');
                return (
                  <tr key={p.id} className="hover:bg-luxury-offblack/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 bg-luxury-offblack border border-luxury-border flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {prodImg ? (
                            <img
                              src={prodImg}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).setAttribute('src', '/agamos-symbol.png');
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-luxury-darkmuted" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-luxury-white">{p.name}</p>
                          <p className="font-mono text-[10px] text-luxury-gold">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{p.category_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-luxury-white">
                      {formatNGN(p.effective_price || p.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.stock_quantity <= 0 ? (
                        <span className="text-red-400 font-semibold">Out of Stock</span>
                      ) : p.is_low_stock ? (
                        <span className="text-amber-400 font-semibold">{p.stock_quantity} (Low)</span>
                      ) : (
                        <span className="text-emerald-400">{p.stock_quantity} Units</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 space-x-1">
                      {p.is_session_product && (
                        <span className="px-1.5 py-0.5 bg-luxury-offblack text-luxury-gold border border-luxury-gold/40 text-[9px] uppercase font-mono">
                          Session Addon
                        </span>
                      )}
                      {p.is_featured && (
                        <span className="px-1.5 py-0.5 bg-luxury-card text-luxury-white border border-luxury-border text-[9px] uppercase">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button variant="outline-gold" size="sm" onClick={() => openEditModal(p)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal with Side-by-Side 2-Column Desktop Grid & Responsive Mobile Scrolling */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Formulation' : 'Add New Formulation'}
        subtitle={editingProduct ? `Updating SKU ${editingProduct.sku}` : 'Fill in the formulation dossier and display image'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Image, Category & Store Flags */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Product Display Image Box */}
              <div className="p-4 bg-luxury-offblack border border-luxury-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-widest text-luxury-gold font-semibold flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Display Image</span>
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="text-[10px] text-red-400 hover:text-red-300 font-mono flex items-center space-x-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Preview Thumbnail */}
                <div className="aspect-square w-full max-h-48 bg-luxury-card border border-luxury-border flex items-center justify-center overflow-hidden relative group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-luxury-muted">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 stroke-1 text-luxury-darkmuted" />
                      <span className="text-xs block text-luxury-muted">No Image Selected</span>
                      <span className="text-[10px] text-luxury-darkmuted">Upload from device or enter URL</span>
                    </div>
                  )}
                </div>

                {/* Upload Buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    variant="outline-gold"
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={<Upload className="w-3.5 h-3.5" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imageFile ? `File: ${imageFile.name.slice(0, 18)}...` : 'Select Image from PC'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-luxury-muted font-medium block">
                      Or Image URL
                    </span>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value || null);
                        setImageFile(null);
                      }}
                      className="w-full bg-luxury-card text-luxury-white placeholder-luxury-darkmuted border border-luxury-border px-3 py-1.5 text-xs outline-none focus:border-luxury-gold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                  className="w-full bg-luxury-offblack text-luxury-white border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Toggles */}
              <div className="p-3.5 bg-luxury-offblack border border-luxury-border space-y-2.5">
                <label className="flex items-center space-x-2.5 text-xs text-luxury-white cursor-pointer select-none">
                  <input type="checkbox" checked={isSessionProduct} onChange={(e) => setIsSessionProduct(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
                  <span>Available as In-Session Add-on</span>
                </label>
                <label className="flex items-center space-x-2.5 text-xs text-luxury-white cursor-pointer select-none">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
                  <span>Featured on Homepage</span>
                </label>
                <label className="flex items-center space-x-2.5 text-xs text-luxury-white cursor-pointer select-none">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
                  <span>Active in Store</span>
                </label>
              </div>
            </div>

            {/* Right Column: Name, Pricing, Stock & Descriptions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Formulation Name *" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 24K Gold Rejuvenating Face Oil" required />
                <Input label="SKU Code" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Auto-generated if empty" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Regular Price (NGN) *" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <Input label="Sale Price (Optional)" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="e.g. 12000" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Stock Quantity *" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value, 10))} required />
                <Input label="Low-Stock Alert Level" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10))} required />
              </div>

              <Input label="Short Subtitle" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Subtitle for product cards" />

              <div className="space-y-1.5 text-left">
                <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">Formulation Details & Ingredients</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed botanical ingredients, usage rituals, and scent notes"
                  className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Fixed Footer Action Buttons */}
          <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3 sticky bottom-0 bg-luxury-card py-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" isLoading={saving}>
              Save Formulation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
