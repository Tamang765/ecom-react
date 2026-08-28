import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { ApiError, api, endpoints } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { OrderDetail } from '@/types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, total, resetCart, refreshCart, isLoading: cartLoading } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitOrder = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const order = await api.post<OrderDetail>(endpoints.checkout);
      resetCart();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['product'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.code === 'CART_EMPTY') {
        await refreshCart();
        setError('Your cart is empty. Add an item before checking out.');
      } else if (requestError instanceof ApiError && requestError.code === 'INSUFFICIENT_STOCK') {
        await Promise.all([
          refreshCart(),
          queryClient.invalidateQueries({ queryKey: ['products'] }),
          queryClient.invalidateQueries({ queryKey: ['product'] }),
        ]);
        setError('One or more items are no longer available in the requested quantity. Your cart has been refreshed.');
      } else {
        setError(requestError instanceof Error ? requestError.message : 'Could not place your order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || cartLoading) {
    return <div className="container py-8"><div className="h-72 animate-pulse rounded-lg bg-gray-200" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-4 text-gray-600">Please log in to complete your purchase.</p>
        <Button className="mt-6" onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-4 text-gray-600">Your cart is empty.</p>
        <Button className="mt-6" onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container max-w-3xl py-10">
      <nav aria-label="Checkout progress" className="mb-10">
        <ol className="flex items-center">
          {['Cart', 'Review', 'Placed'].map((step, index) => {
            const completed = index === 0;
            const active = index === 1;
            return (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <span className="flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${completed ? 'bg-success text-white' : active ? 'bg-primary text-white' : 'border border-gray-300 bg-white text-gray-400'}`}>
                    {completed ? <span aria-hidden="true">✓</span> : index + 1}
                  </span>
                  <span className={`hidden text-sm sm:block ${active ? 'font-semibold text-primary' : completed ? 'font-medium text-success' : 'text-gray-400'}`}>{step}</span>
                </span>
                {index < 2 && <span className="mx-3 h-px flex-1 bg-gray-200" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>
      </nav>
      <p className="eyebrow">Step 2 of 3</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Review your order</h1>
      <p className="mt-2 text-gray-600">Inventory and prices are verified by the server when you place the order.</p>
      <div className="card mt-8 p-6">
        <h2 className="text-lg font-semibold text-gray-900">Order items</h2>
        <div className="mt-4 divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-4 py-4 text-sm">
              <span className="text-gray-700"><span className="font-medium text-gray-900">{item.name}</span><span className="ml-2 text-gray-500">× {item.quantity}</span></span>
              <span className="font-semibold text-gray-900">{formatPrice(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-4 text-lg font-semibold">
          <span>Total</span><span>{formatPrice(total)}</span>
        </div>
      </div>
      {error && <div className="alert-error mt-4" role="alert">{error}</div>}
      <Button className="mt-6 w-full" size="lg" onClick={submitOrder} isLoading={isSubmitting}>Place Order</Button>
      <p className="mt-3 text-center text-xs text-gray-500">This creates the order immediately. The current API does not include a payment step.</p>
      </div>
    </div>
  );
}
