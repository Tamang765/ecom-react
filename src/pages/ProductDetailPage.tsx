import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { ApiError, api, endpoints } from '@/lib/api';
import { formatPrice, getImageUrl } from '@/lib/utils';
import type { Product } from '@/types';

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [added, setAdded] = useState(false);

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => api.get<Product>(endpoints.products.detail(productId!)),
    enabled: Boolean(productId),
  });

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    setAddError('');
    setAdded(false);
    try {
      await addItem(product.id, quantity);
      setAdded(true);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.code === 'INSUFFICIENT_STOCK') {
        const refreshed = await refetch();
        if (refreshed.data) {
          setQuantity((current) => Math.max(1, Math.min(current, refreshed.data!.stock)));
        }
        setAddError('The requested quantity is no longer available. Please choose fewer items.');
      } else if (requestError instanceof ApiError && requestError.code === 'PRODUCT_NOT_FOUND') {
        await refetch();
        setAddError('This product is no longer available.');
      } else {
        setAddError(requestError instanceof Error ? requestError.message : 'Could not add this item');
      }
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-1/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-16 text-center">
        <p className="text-red-600">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  const purchasable = product.isActive && product.stock > 0;

  return (
    <div className="bg-gray-50">
      <div className="container py-10">
      <nav className="mb-8 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link to="/products" className="hover:text-primary">Products</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="card grid grid-cols-1 gap-8 p-4 sm:p-6 lg:grid-cols-2 lg:gap-10">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col py-2 lg:py-6">
          <p className="eyebrow">Product details</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
          <p className="mt-4 text-3xl font-semibold text-gray-900">{formatPrice(product.price)}</p>
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-900">Description</h2>
            <p className="mt-2 leading-7 text-gray-600">
              {product.description ?? 'No description is available for this product.'}
            </p>
          </div>

          <p className={`mt-6 inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-medium ${purchasable ? 'bg-success-background text-success' : 'bg-error-background text-error'}`}>
            {!product.isActive
              ? 'This product is currently unavailable'
              : product.stock > 0
                ? `In stock (${product.stock} available)`
                : 'Out of stock'}
          </p>

          {addError && <p className="alert-error mt-4" role="alert">{addError}</p>}
          {added && <p className="alert-success mt-4" role="status">Added to your cart.</p>}

          {purchasable && (
            <div className="mt-auto pt-8">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantity</label>
                <select
                id="quantity"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="input w-20"
              >
                {[...Array(Math.min(10, product.stock))].map((_, index) => (
                  <option key={index + 1} value={index + 1}>{index + 1}</option>
                ))}
                </select>
              </div>
              <Button size="lg" className="mt-4 w-full" onClick={handleAddToCart} isLoading={isAdding}>
                {isAuthenticated ? 'Add to Cart' : 'Log in to Add to Cart'}
              </Button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
