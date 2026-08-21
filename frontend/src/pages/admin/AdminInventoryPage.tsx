import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, Plus, ArrowUpRight, ArrowDownRight, History, Package } from 'lucide-react';
import { api } from '../../services/api';
import { Product, InventoryTransaction } from '../../types';
import { formatNGN, formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityChange, setQuantityChange] = useState<number>(10);
  const [transactionType, setTransactionType] = useState<string>('RESTOCK');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        api.inventory.getOverview(),
        api.inventory.getTransactions(),
      ]);
      setProducts(pRes);
      setTransactions(tRes);
    } catch (err: any) {
      error('Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdjustModal = (p: Product) => {
    setSelectedProduct(p);
    setQuantityChange(10);
    setTransactionType('RESTOCK');
    setNotes('');
    setAdjustModal(true);
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      await api.inventory.adjustStock({
        product_id: selectedProduct.id,
        quantity_change: quantityChange,
        transaction_type: transactionType,
        notes,
      });
      success('Inventory Adjusted', `Stock level for ${selectedProduct.name} updated.`);
      setAdjustModal(false);
      loadData();
    } catch (err: any) {
      error('Adjustment Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockCount = products.filter((p) => p.is_low_stock).length;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-luxury-border pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Stock Control & Audit Ledger
          </span>
          <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
            Inventory Management
          </h1>
        </div>
        {lowStockCount > 0 && (
          <div className="px-3 py-1.5 bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{lowStockCount} items below safety threshold</span>
          </div>
        )}
      </div>

      {/* Stock Table */}
      <div className="bg-luxury-card border border-luxury-border overflow-hidden shadow-2xl">
        <div className="p-4 bg-luxury-offblack border-b border-luxury-border flex justify-between items-center">
          <h3 className="font-serif text-lg text-luxury-white">Live Stock Levels</h3>
          <span className="text-xs text-luxury-muted">{products.length} Products Monitored</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-luxury-muted">
            <thead className="bg-luxury-offblack uppercase text-[10px] tracking-widest text-luxury-gold border-b border-luxury-border font-semibold">
              <tr>
                <th className="py-3.5 px-4">Formulation</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Threshold</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-luxury-offblack/40">
                  <td className="py-3.5 px-4 font-medium text-luxury-white">{p.name}</td>
                  <td className="py-3.5 px-4 font-mono text-luxury-gold">{p.sku}</td>
                  <td className="py-3.5 px-4 font-bold text-luxury-white text-sm">{p.stock_quantity} Units</td>
                  <td className="py-3.5 px-4">{p.low_stock_threshold} Units</td>
                  <td className="py-3.5 px-4">
                    {p.stock_quantity <= 0 ? (
                      <span className="px-2 py-0.5 bg-red-950/80 text-red-300 border border-red-500/40 text-[10px] uppercase font-semibold">
                        Sold Out
                      </span>
                    ) : p.is_low_stock ? (
                      <span className="px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-semibold">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-semibold">
                        Optimal
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="gold" size="sm" onClick={() => openAdjustModal(p)}>
                      Adjust Stock
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Ledger Table */}
      <div className="bg-luxury-card border border-luxury-border overflow-hidden shadow-2xl">
        <div className="p-4 bg-luxury-offblack border-b border-luxury-border flex items-center space-x-2 text-luxury-gold">
          <History className="w-4 h-4" />
          <h3 className="font-serif text-lg text-luxury-white">Immutable Audit Ledger</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-luxury-muted">
            <thead className="bg-luxury-offblack uppercase text-[10px] tracking-widest text-luxury-gold border-b border-luxury-border font-semibold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Formulation</th>
                <th className="py-3.5 px-4">Change</th>
                <th className="py-3.5 px-4">Balance After</th>
                <th className="py-3.5 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/60">
              {transactions.slice(0, 15).map((t) => (
                <tr key={t.id} className="hover:bg-luxury-offblack/40">
                  <td className="py-3.5 px-4">{formatDate(t.created_at)}</td>
                  <td className="py-3.5 px-4 font-medium text-luxury-white">{t.product_name}</td>
                  <td className="py-3.5 px-4 font-semibold">
                    {t.quantity_change > 0 ? (
                      <span className="text-emerald-400">+{t.quantity_change}</span>
                    ) : (
                      <span className="text-red-400">{t.quantity_change}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-luxury-white">{t.balance_after}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-luxury-gold mr-2">{t.transaction_type}</span>
                    <span className="text-luxury-muted">{t.notes}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <Modal
          isOpen={adjustModal}
          onClose={() => setAdjustModal(false)}
          title={`Adjust Stock: ${selectedProduct.name}`}
          subtitle={`Current stock: ${selectedProduct.stock_quantity} units`}
          maxWidth="md"
        >
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs uppercase tracking-widest text-luxury-muted font-medium">
                Adjustment Type *
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full bg-luxury-offblack text-luxury-white border border-luxury-border p-3 text-xs outline-none focus:border-luxury-gold"
              >
                <option value="RESTOCK">RESTOCK (+ Addition)</option>
                <option value="MANUAL_CORRECTION">MANUAL AUDIT CORRECTION (+/-)</option>
                <option value="DAMAGED">DAMAGED / SHRINKAGE (- Reduction)</option>
                <option value="RETURN">CUSTOMER RETURN (+ Addition)</option>
              </select>
            </div>

            <Input
              label="Quantity Change (e.g. 10 or -3) *"
              type="number"
              value={quantityChange}
              onChange={(e) => setQuantityChange(parseInt(e.target.value, 10))}
              required
            />

            <Input
              label="Audit Justification Notes *"
              placeholder="e.g. Shipment arrival batch #LAG-2026-08"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required
            />

            <div className="pt-4 border-t border-luxury-border flex justify-end space-x-3">
              <Button variant="ghost" size="sm" type="button" onClick={() => setAdjustModal(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="md" type="submit" isLoading={submitting}>
                Apply Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
