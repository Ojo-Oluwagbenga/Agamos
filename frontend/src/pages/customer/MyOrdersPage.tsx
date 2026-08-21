import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Store, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';
import { formatNGN, formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center border-b border-luxury-border pb-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-luxury-white">
            Beauty Store Order History
          </h2>
          <p className="text-xs text-luxury-muted mt-0.5">
            Track fulfillment status, courier dispatch, and purchase receipts.
          </p>
        </div>
        <Link to="/shop">
          <Button variant="gold" size="sm">
            Visit Store
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-luxury-card border border-luxury-border p-12 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-luxury-darkmuted mx-auto" />
          <h3 className="font-serif text-xl text-luxury-white">No Order History</h3>
          <p className="text-xs text-luxury-muted max-w-sm mx-auto">
            Explore our formulations including green caviar masks, 24K gold serums, and hair elixirs.
          </p>
          <Link to="/shop" className="inline-block pt-2">
            <Button variant="gold" size="md">
              Shop Beauty Store
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-luxury-card border border-luxury-border p-6 sm:p-8 space-y-6 shadow-xl"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-luxury-border/60 pb-4 gap-2">
                <div className="space-y-0.5">
                  <span className="font-mono text-sm text-luxury-gold font-semibold tracking-wider">
                    {order.order_reference}
                  </span>
                  <p className="text-[11px] text-luxury-muted">
                    Placed on {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge status={order.status} />
                  <Link to={`/order/${order.order_reference}`}>
                    <Button variant="outline-gold" size="sm">
                      Receipt
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-luxury-border/40">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-luxury-white">{item.product_name}</p>
                      <p className="text-[11px] text-luxury-muted">Qty: {item.quantity} &bull; SKU: {item.sku}</p>
                    </div>
                    <span className="font-semibold text-luxury-white">{formatNGN(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Total and Fulfillment Method */}
              <div className="pt-4 border-t border-luxury-border/60 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                <div className="flex items-center space-x-2 text-luxury-muted">
                  {order.delivery_type === 'PICKUP' ? (
                    <Store className="w-4 h-4 text-luxury-gold" />
                  ) : (
                    <Truck className="w-4 h-4 text-luxury-gold" />
                  )}
                  <span>Fulfillment: <strong>{order.delivery_type_display}</strong></span>
                </div>
                <div>
                  <span className="text-luxury-muted mr-2">Total Paid:</span>
                  <span className="font-sans text-base font-semibold text-luxury-gold">
                    {formatNGN(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
