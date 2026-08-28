import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { api, endpoints } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import type { OrderSummary } from '@/types';

const statusColors = {
  placed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<OrderSummary[]>(endpoints.orders.list),
    enabled: isAuthenticated,
  });

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="mt-4 text-gray-600">Log in to view your orders.</p>
        <Button className="mt-6" onClick={() => navigate('/login')}>Log in</Button>
      </div>
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <div className="mt-8 h-32 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return <div className="container py-16 text-center text-red-600">Failed to load orders. Please try again later.</div>;
  }

  return (
    <div className="bg-gray-50">
      <div className="container py-10">
      <p className="eyebrow">Account</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Order history</h1>
      <p className="mt-2 text-gray-600">Review every order and its original item details.</p>
      {orders.length > 0 ? (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card card-hover block p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-sm font-medium text-gray-900">Order #{order.id}</p>
                  <p className="mt-1 text-sm text-gray-600">{formatDate(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? 'line item' : 'line items'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" /></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card mt-10 p-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400" aria-hidden="true"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h2m6 13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /></svg></span>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">No orders yet</h2>
          <p className="mt-2 text-gray-600">Start shopping to place your first order.</p>
          <Link to="/products" className="mt-6 inline-block"><Button>Browse Products</Button></Link>
        </div>
      )}
      </div>
    </div>
  );
}
