import { api, endpoints } from "@/lib/api";
import { formatPrice, getImageUrl } from "@/lib/utils";
import type { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "react-router-dom";

// const categories = [
//   {
//     name: "Electronics",
//     image:
//       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=360&q=80",
//     fallback: "🎧",
//   },
//   {
//     name: "Fashion",
//     image:
//       "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=360&q=80",
//     fallback: "👗",
//   },
//   {
//     name: "Luxury",
//     image:
//       "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=360&q=80",
//     fallback: "👜",
//   },
//   {
//     name: "Home Decor",
//     image:
//       "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=360&q=80",
//     fallback: "🏡",
//   },
//   {
//     name: "Health & Beauty",
//     image:
//       "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=360&q=80",
//     fallback: "✨",
//   },
//   {
//     name: "Groceries",
//     image:
//       "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=360&q=80",
//     fallback: "🥑",
//   },
//   {
//     name: "Footwear",
//     image:
//       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=360&q=80",
//     fallback: "👟",
//   },
// ];

function ArrowIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ProductCard({ product }: { product: Product }) {
  const purchasable = product.isActive && product.stock > 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="min-w-0 group rounded-xl focus-visible:ring-offset-4"
    >
      <div className="relative aspect-[1.08/1] overflow-hidden rounded-xl bg-[#f5f6f7]">
        <span
          className="absolute inset-0 grid text-5xl text-gray-300 place-items-center"
          aria-hidden="true"
        >
          🛒
        </span>
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          className="relative object-cover w-full h-full transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        {!purchasable && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-gray-950/90 px-2.5 py-1 text-[10px] font-bold text-white">
            {product.isActive ? "Out of stock" : "Unavailable"}
          </span>
        )}
        {purchasable && product.stock <= 5 && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 shadow-sm">
            Only {product.stock} left
          </span>
        )}
        <span
          className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-gray-500 shadow-sm transition group-hover:bg-gray-900 group-hover:text-white"
          aria-hidden="true"
        >
          <ArrowIcon className="h-3.5 w-3.5" />
        </span>
      </div>
      <h3 className="mt-3 text-sm font-medium leading-5 text-gray-800 transition line-clamp-2 min-h-10 group-hover:text-primary">
        {product.name}
      </h3>
      <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-4 text-gray-500">
        {product.description ?? "Discover this product in the ecom catalogue."}
      </p>
      <div className="flex items-center justify-between gap-2 mt-2">
        <span className="text-sm font-extrabold text-gray-950">
          {formatPrice(product.price)}
        </span>
        <span
          className={`text-[10px] font-semibold ${purchasable ? "text-emerald-700" : "text-gray-400"}`}
        >
          {purchasable ? "In stock" : "Not available"}
        </span>
      </div>
    </Link>
  );
}

function ProductShelf({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="market-section">
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">
          {title}
        </h2>
        <Link
          to="/products"
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-[#005b9a] hover:text-primary"
        >
          View all <ArrowIcon />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-5 lg:gap-x-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ProductShelfSkeleton() {
  return (
    <section
      className="market-section"
      aria-label="Loading products"
      aria-busy="true"
    >
      <div className="mb-5 bg-gray-200 rounded h-7 w-52 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className={item === 4 ? "hidden lg:block" : ""}>
            <div className="aspect-[1.08/1] animate-pulse rounded-xl bg-gray-200" />
            <div className="w-4/5 h-4 mt-3 bg-gray-200 rounded animate-pulse" />
            <div className="w-2/5 h-4 mt-2 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<Product[]>(endpoints.products.list),
  });

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive),
    [products],
  );
  const newestProducts = useMemo(
    () =>
      [...activeProducts]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [activeProducts],
  );
  const bestValueProducts = useMemo(
    () =>
      [...activeProducts]
        .sort((a, b) => Number(a.price) - Number(b.price))
        .slice(0, 5),
    [activeProducts],
  );
  // const wellStockedProducts = useMemo(
  //   () => [...activeProducts].sort((a, b) => b.stock - a.stock).slice(0, 5),
  //   [activeProducts],
  // );
  const featuredProduct = newestProducts.find((product) => product.stock > 0);

  return (
    <div className="bg-white market-home">
      <div className="market-container">
        <section className="grid gap-3 pt-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,0.92fr)] lg:gap-4 lg:pt-5">
          <article className="group relative min-h-[340px] overflow-hidden rounded-2xl bg-[#071b47] sm:min-h-[420px] lg:min-h-[390px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,#2877da_0,transparent_30%),linear-gradient(120deg,#071739_0%,#0e296b_52%,#d9e9ff_100%)]" />
            <div className="absolute inset-y-0 right-[-13%] w-[70%] sm:right-[-4%] sm:w-[58%]">
              <span
                className="absolute inset-0 grid place-items-center text-[150px] opacity-20 sm:text-[210px]"
                aria-hidden="true"
              >
                📱
              </span>
              <img
                src={
                  featuredProduct
                    ? getImageUrl(featuredProduct.imageUrl)
                    : "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=90"
                }
                alt={featuredProduct?.name ?? "Midnight smartphone"}
                className="relative object-cover object-center w-full h-full transition duration-700 mix-blend-lighten group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#071b47] via-transparent to-transparent" />
            </div>
            <div className="relative z-10 flex min-h-[340px] max-w-[72%] flex-col justify-center px-6 py-10 text-white sm:min-h-[420px] sm:max-w-[54%] sm:px-10 lg:min-h-[390px] lg:px-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                {featuredProduct
                  ? "Just added to ecom"
                  : "Discover something new"}
              </p>
              <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                {featuredProduct?.name ?? "Power. Refined."}
                <br />
                <span className="text-blue-200">
                  {featuredProduct
                    ? formatPrice(featuredProduct.price)
                    : "Shop the collection."}
                </span>
              </h1>
              <p className="max-w-sm mt-4 text-xs leading-5 text-blue-100 sm:text-sm">
                {featuredProduct?.description ??
                  "Fresh finds, trusted prices and one simple place to shop."}
              </p>
              <Link
                to={
                  featuredProduct
                    ? `/products/${featuredProduct.id}`
                    : "/products"
                }
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#071b47] shadow-lg transition hover:bg-blue-50"
              >
                Shop now <ArrowIcon />
              </Link>
            </div>
          </article>

          <article className="group relative min-h-[270px] overflow-hidden rounded-2xl bg-[#88deea] sm:min-h-[340px] lg:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=90"
              alt="Running shoe"
              className="absolute inset-0 object-cover w-full h-full transition duration-700 group-hover:scale-105"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/90 via-cyan-400/30 to-transparent" />
            <div className="relative z-10 p-6 text-white sm:p-8">
              <p className="text-sm font-bold tracking-widest uppercase">
                Shop the edit
              </p>
              <p className="mt-2 max-w-[8ch] text-4xl font-black leading-none">
                Made for moving
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 px-4 py-2 mt-5 text-xs font-bold rounded-full bg-white/95 text-cyan-800 hover:bg-white"
              >
                View catalogue <ArrowIcon />
              </Link>
            </div>
          </article>
        </section>

        <div className="flex justify-center gap-1.5 py-4" aria-hidden="true">
          <span className="h-1.5 w-5 rounded-full bg-gray-900" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
        </div>
        {/* 
        <section className="pt-6 market-section">
          <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-bold tracking-tight text-gray-950 sm:text-2xl">Explore Popular Categories</h2><Link to="/products" className="flex items-center gap-1 text-xs font-bold text-[#005b9a] hover:text-primary">View all <ArrowIcon /></Link></div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-7 sm:gap-4">{categories.map((category) => <Link key={category.name} to="/products" className="text-center group"><div className="relative mx-auto aspect-square w-full max-w-[132px] overflow-hidden rounded-full bg-[#f3f5f7] ring-1 ring-transparent transition group-hover:-translate-y-1 group-hover:ring-gray-200 group-hover:shadow-md"><span className="absolute inset-0 grid text-4xl place-items-center" aria-hidden="true">{category.fallback}</span><img src={category.image} alt="" loading="lazy" className="relative object-cover w-full h-full" onError={(event) => { event.currentTarget.style.display = 'none'; }} /></div><h3 className="mt-2 text-[10px] font-semibold text-gray-800 sm:text-xs">{category.name}</h3></Link>)}</div>
        </section> */}

        {isLoading && <ProductShelfSkeleton />}
        {error && (
          <section className="market-section">
            <div className="px-6 py-10 text-center border border-red-100 rounded-2xl bg-red-50">
              <h2 className="text-lg font-bold text-gray-900">
                We couldn't load the latest products
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Check that the API is running, then try again.
              </p>
              <button
                type="button"
                className="mt-5 btn btn-primary"
                onClick={() => void refetch()}
              >
                Try again
              </button>
            </div>
          </section>
        )}
        {!isLoading && !error && activeProducts.length === 0 && (
          <section className="market-section">
            <div className="px-6 py-12 text-center rounded-2xl bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                New products are on the way
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                The catalogue is currently empty. Check back soon.
              </p>
            </div>
          </section>
        )}
        {!isLoading && !error && (
          <ProductShelf
            title="Fresh From The Catalogue"
            products={newestProducts}
          />
        )}

        <section className="grid gap-4 market-section md:grid-cols-3">
          <Link
            to="/products"
            className="promo-card group bg-[#a81855] text-white"
          >
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=85"
              alt="Fresh vegetables"
              loading="lazy"
              className="absolute inset-0 object-cover w-full h-full transition duration-500 opacity-85 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#a81855] via-[#a81855]/65 to-transparent" />
            <div className="promo-copy">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-pink-100">
                Fresh and healthy
              </p>
              <h2>
                Everyday
                <br />
                goodness
              </h2>
              <span>Explore groceries</span>
            </div>
          </Link>
          <Link
            to="/products"
            className="promo-card group bg-[#a6d6ff] text-[#10284d]"
          >
            <img
              src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=700&q=85"
              alt="Smartphone offer"
              loading="lazy"
              className="absolute inset-0 object-cover w-full h-full transition duration-500 opacity-80 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#a6d6ff] via-[#a6d6ff]/85 to-transparent" />
            <div className="promo-copy">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                Tech, simplified
              </p>
              <h2>
                Make an
                <br />
                upgrade
              </h2>
              <span>Discover now</span>
            </div>
          </Link>
          <Link
            to="/products"
            className="promo-card group bg-[#e71924] text-white"
          >
            <img
              src="https://images.unsplash.com/photo-1584473457493-17c4c24290c8?auto=format&fit=crop&w=700&q=85"
              alt="Pantry essentials"
              loading="lazy"
              className="absolute inset-0 object-cover w-full h-full transition duration-500 opacity-80 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#df1520] via-[#df1520]/75 to-transparent" />
            <div className="promo-copy">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-100">
                Pantry picks
              </p>
              <h2>
                Big flavour.
                <br />
                Simple shopping.
              </h2>
              <span>Browse products</span>
            </div>
          </Link>
        </section>

        {!isLoading && !error && (
          <ProductShelf
            title="Great Value Finds"
            products={bestValueProducts}
          />
        )}

        <section className="pb-20 market-section">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#082b3e] px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Your ecom account
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">
                Save your cart and keep every order together.
              </h2>
            </div>
            <Link
              to="/register"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#082b3e] transition hover:bg-cyan-50"
            >
              Join for free
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
