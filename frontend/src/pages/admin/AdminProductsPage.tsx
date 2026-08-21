import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Package, Search, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Product, ProductCategory } from '../../types';
import { formatNGN } from '../../utils/formatters';
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

  // Form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [price, setPrice] = useState('15000');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState(20);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [isSessionProduct, setIsSessionProduct] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

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
      if (cats.length > 0 && !categoryId) {
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
    setPrice('15000');
    setSalePrice('');
    setStockQuantity(20);
    setLowStockThreshold(5);
    setShortDescription('');
    setDescription('');
    setIsSessionProduct(false);
    setIsFeatured(false);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.category);
    setPrice(String(p.price));
    setSalePrice(p.sale_price ? String(p.sale_price) : '');
    setStockQuantity(p.stock_quantity);
    setLowStockThreshold(p.low_stock_threshold);
    setShortDescription(p.short_description || '');
    setDescription(p.description || '');
    setIsSessionProduct(p.is_session_product);
    setIsFeatured(p.is_featured);
    setIsActive(p.is_active);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      sku,
      category: categoryId,
      price,
      sale_price: salePrice || null,
      stock_quantity: stockQuantity,
      low_stock_threshold: lowStockThreshold,
      short_description: shortDescription,
      description,
      is_session_product: isSessionProduct,
      is_featured: isFeatured,
      is_active: isActive,
    };

    try {
      if (editingProduct) {
        await api.admin.updateProduct(editingProduct.id, payload);
        success('Product Updated', `${name} updated.`);
      } else {
        await api.admin.createProduct(payload);
        success('Product Created', `${name} created.`);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      error('Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-luxury-border pb-6">
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
                <th className="py-3.5 px-4">Product Name & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Add-on / Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-luxury-offblack/40">
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-luxury-white">{p.name}</p>
                    <p className="font-mono text-[10px] text-luxury-gold">{p.sku}</p>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Formulation' : 'Add New Formulation'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Product Name *" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="SKU *" value={sku} onChange={(e) => setSku(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <Input label="Base Price (NGN) *" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Input label="Sale Price (Optional)" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="e.g. 12000" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Stock Quantity *" type="number" value={stockQuantity} onChange={(e) => setStockQuantity(parseInt(e.target.value, 10))} required />
            <Input label="Low-Stock Threshold *" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10))} required />
          </div>

          <Input label="Short Summary *" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />

          <div className="space-y-1.5 text-left">
            <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">Full Formulation Details & Ingredients</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-luxury-offblack text-luxury-white placeholder-luxury-darkmuted border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold"
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center space-x-2 text-xs text-luxury-white cursor-pointer">
              <input type="checkbox" checked={isSessionProduct} onChange={(e) => setIsSessionProduct(e.target.checked)} className="accent-[#D4AF37]" />
              <span>Available as In-Session Add-on</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-luxury-white cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-[#D4AF37]" />
              <span>Featured on Homepage</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-luxury-white cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-[#D4AF37]" />
              <span>Active in Store</span>
            </label>
          </div>

          <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="gold" size="md" type="submit" isLoading={saving}>Save Formulation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
