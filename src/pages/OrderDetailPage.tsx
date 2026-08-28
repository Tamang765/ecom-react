import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { api, endpoints } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import type { OrderDetail } from '@/types';

const statusColors = {
  placed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

export function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get<OrderDetail>(endpoints.orders.detail(orderId!)),
    enabled: isAuthenticated && Boolean(orderId),
  });

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <p className="text-gray-600">Log in to view this order.</p>
        <Button className="mt-6" onClick={() => navigate('/login')}>Log in</Button>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return <div className="container py-8"><div className="h-72 animate-pulse rounded-lg bg-gray-200" /></div>;
  }

  if (error || !order) {
    return (
      <div className="container py-16 text-center">
        <p className="text-red-600">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block text-primary hover:underline">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/orders" className="text-sm text-primary hover:underline">← Back to Orders</Link>
          <p className="eyebrow mt-4">Order details</p>
          <h1 className="mt-2 break-all font-mono text-2xl font-bold text-gray-900 sm:text-3xl">Order #{order.id}</h1>
          <p className="mt-1 text-gray-600">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`self-start rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="border-b border-gray-200 px-6 py-4"><h2 className="text-lg font-semibold text-gray-900">Order Items</h2></div>
          <div className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <div key={item.productId} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:p-6">
                <div>
                  <h3 className="font-medium text-gray-900">{item.productName}</h3>
                  <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                </div>
                <p className="font-semibold text-gray-900 sm:text-right">{formatPrice(item.lineTotal)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card h-fit p-6">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
