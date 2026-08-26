import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { api, endpoints } from '@/lib/api';
import { formatPrice, getImageUrl } from '@/lib/utils';
import type { Product } from '@/types';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name';

export function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [sort, setSort] = useState<SortOption>('newest');

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
  }, [searchParams]);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>(endpoints.products.list),
  });

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? products.filter((product) =>
          [product.name, product.description ?? ''].some((value) =>
            value.toLowerCase().includes(query),
          ),
        )
      : products;

    return [...filtered].sort((a, b) => {
      if (sort === 'price_asc') return Number(a.price) - Number(b.price);
      if (sort === 'price_desc') return Number(b.price) - Number(a.price);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, search, sort]);

  if (error) {
    return (
      <div className="container py-16 text-center">
        <p className="text-red-600">Failed to load products. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <section className="page-header">
        <div className="container py-10">
          <p className="eyebrow">Catalogue</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Products</h1>
          <p className="mt-2 max-w-2xl text-gray-600">Browse the full collection and find the right product for you.</p>
        </div>
      </section>

      <div className="container py-10">
        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <Input
          label="Search products"
          type="search"
          placeholder="Search by name or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="sm:w-72"
        />
        <label className="space-y-1 text-sm font-medium text-gray-700">
          <span className="block">Sort by</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="input w-full sm:w-auto"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-600">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {visibleProducts.map((product) => {
            const purchasable = product.isActive && product.stock > 0;
            return (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="card card-hover group flex h-full flex-col overflow-hidden"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {!purchasable && (
                    <span className="absolute left-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-medium text-white">
                      {!product.isActive ? 'Unavailable' : 'Out of stock'}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="line-clamp-2 font-medium text-gray-900">{product.name}</h2>
                  <p className="mt-2 text-lg font-semibold text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                  <p className={`mt-1 min-h-5 text-sm ${purchasable && product.stock <= 5 ? 'text-warning' : 'text-gray-500'}`}>
                    {purchasable
                      ? product.stock <= 5
                        ? `Only ${product.stock} left in stock`
                        : 'In stock'
                      : 'Not available to purchase'}
                  </p>
                  <span className="btn btn-primary mt-4 w-full">View product</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
