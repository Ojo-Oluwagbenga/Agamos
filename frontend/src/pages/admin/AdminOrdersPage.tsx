import React, { useEffect, useState } from 'react';
import { Truck, Store } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { formatNGN, formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { success, error } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await api.admin.listOrders({
        status: statusFilter || undefined,
      });
      setOrders(data);
    } catch (err: any) {
      error('Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.admin.updateOrder(orderId, { status });
      success('Order Updated', `Order status updated to ${status}.`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: status as any });
      }
      loadOrders();
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-luxury-border pb-6">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-ultra-wide text-luxury-gold font-semibold">
            Store Fulfillment Pipeline
          </span>
          <h1 className="font-serif text-3xl font-normal text-luxury-white mt-1">
            Orders & Packaging
          </h1>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-luxury-offblack text-luxury-white border border-luxury-border px-3 py-2 text-xs outline-none focus:border-luxury-gold"
        >
          <option value="">All Fulfillment Statuses</option>
          <option value="PAID">PAID</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className="bg-luxury-card border border-luxury-border overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-luxury-muted">
            <thead className="bg-luxury-offblack uppercase text-[10px] tracking-widest text-luxury-gold border-b border-luxury-border font-semibold">
              <tr>
                <th className="py-3.5 px-4">Order Ref & Guest</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border/60">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-luxury-offblack/40">
                  <td className="py-3.5 px-4">
                    <p className="font-mono text-luxury-gold font-semibold">{o.order_reference}</p>
                    <p className="font-medium text-luxury-white">{o.guest_name}</p>
                    <p className="text-[10px] text-luxury-muted">{o.guest_email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5 text-luxury-white">
                      {o.delivery_type === 'PICKUP' ? (
                        <Store className="w-3.5 h-3.5 text-luxury-gold" />
                      ) : (
                        <Truck className="w-3.5 h-3.5 text-luxury-gold" />
                      )}
                      <span>{o.delivery_type_display}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">{formatDate(o.created_at)}</td>
                  <td className="py-3.5 px-4 font-semibold text-luxury-white">{formatNGN(o.total_amount)}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={o.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="outline-gold" size="sm" onClick={() => setSelectedOrder(o)}>
                      Manage Order
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Fulfillment Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order: ${selectedOrder.order_reference}`}
          subtitle={`Customer: ${selectedOrder.guest_name}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs text-luxury-muted">
            {/* Status Transition Bar */}
            <div className="bg-luxury-offblack border border-luxury-border p-4 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold block">
                Update Fulfillment Pipeline
              </span>
              <div className="flex flex-wrap gap-2">
                {['PAID', 'PROCESSING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className={`px-3 py-1.5 text-[10px] uppercase font-semibold border transition-all ${
                      selectedOrder.status === st
                        ? 'bg-luxury-gold text-luxury-black border-luxury-gold'
                        : 'bg-luxury-card text-luxury-white border-luxury-border hover:border-luxury-gold'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 bg-luxury-offblack border border-luxury-border p-4">
              <div>
                <p className="font-semibold text-luxury-white">Recipient:</p>
                <p>{selectedOrder.guest_name}</p>
                <p>{selectedOrder.guest_phone}</p>
                <p>{selectedOrder.guest_email}</p>
              </div>
              <div>
                <p className="font-semibold text-luxury-white">Fulfillment Address:</p>
                {selectedOrder.delivery_type === 'PICKUP' ? (
                  <p className="text-luxury-gold">Flagship Store Pickup (Victoria Island)</p>
                ) : (
                  <p>{selectedOrder.shipping_address}, {selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-semibold block">
                Purchased Formulations ({selectedOrder.items?.length || 0})
              </span>
              <div className="divide-y divide-luxury-border/60 bg-luxury-offblack border border-luxury-border p-3">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-luxury-white">{item.product_name}</p>
                      <p className="text-[10px] text-luxury-muted">SKU: {item.sku} &bull; Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-luxury-white">{formatNGN(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-luxury-border flex justify-between items-center text-sm">
              <span className="text-luxury-white font-semibold">Total Order Value:</span>
              <span className="font-sans text-base font-bold text-luxury-gold">{formatNGN(selectedOrder.total_amount)}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
