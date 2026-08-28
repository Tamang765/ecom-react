import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export function CartPage() {
  const { isAuthenticated } = useAuth();
  const { items, totalItems, total, updateItem, removeItem, isLoading, error } = useCart();
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState('');

  const changeQuantity = async (productId: string, quantity: number) => {
    setPendingProductId(productId);
    setMutationError('');
    try {
      await updateItem(productId, quantity);
    } catch (requestError) {
      setMutationError(
        requestError instanceof ApiError && requestError.code === 'INSUFFICIENT_STOCK'
          ? 'Stock changed while you were shopping. Choose a lower quantity.'
          : requestError instanceof Error
            ? requestError.message
            : 'Could not update your cart',
      );
    } finally {
      setPendingProductId(null);
    }
  };

  const remove = async (productId: string) => {
    setPendingProductId(productId);
    setMutationError('');
    try {
      await removeItem(productId);
    } catch (requestError) {
      setMutationError(requestError instanceof Error ? requestError.message : 'Could not remove this item');
    } finally {
      setPendingProductId(null);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mt-4 text-gray-600">Log in to view and manage your persistent cart.</p>
        <Link to="/login" className="mt-6 inline-block"><Button>Log in</Button></Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <div className="mt-8 h-40 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (error) {
    return <div className="container py-16 text-center text-red-600">{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Start shopping to add items to your cart.</p>
        <Link to="/products" className="mt-6 inline-block"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container py-10">
      <p className="eyebrow">Your basket</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping cart</h1>
      <p className="mt-2 text-gray-600">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
      {mutationError && <div className="alert-error mt-4" role="alert">{mutationError}</div>}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="card p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to={`/products/${item.productId}`} aria-label={`View ${item.name}`} className="flex h-24 w-full shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 sm:w-24">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 8h12l-1 12H7L6 8Zm3 1V6a3 3 0 0 1 6 0v3" /></svg>
                </Link>
                <div className="flex flex-1 flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <Link to={`/products/${item.productId}`} className="font-medium text-gray-900 hover:text-primary">{item.name}</Link>
                    <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)} each</p>
                    {item.stock <= 5 && <p className="mt-1 text-xs text-amber-600">{item.stock} available</p>}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-md border border-gray-300 bg-white" aria-label={`Quantity for ${item.name}`}>
                      <Button variant="ghost" size="sm" aria-label={`Decrease ${item.name} quantity`} onClick={() => changeQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1 || pendingProductId === item.productId}>−</Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="ghost" size="sm" aria-label={`Increase ${item.name} quantity`} onClick={() => changeQuantity(item.productId, item.quantity + 1)} disabled={item.quantity >= item.stock || pendingProductId === item.productId}>+</Button>
                    </div>
                    <span className="min-w-20 text-right font-semibold text-gray-900">{formatPrice(item.lineTotal)}</span>
                    <Button variant="ghost" size="sm" onClick={() => remove(item.productId)} disabled={pendingProductId === item.productId} className="text-red-600 hover:text-red-700">Remove</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
              <span className="text-gray-600">Items</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="mt-3 flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{formatPrice(total)}</span>
            </div>
            <Link to="/checkout" className="mt-6 block"><Button className="w-full" size="lg">Review Order</Button></Link>
            <Link to="/products" className="mt-4 block rounded text-center text-sm font-medium text-primary hover:text-primary-hover">Continue shopping</Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
