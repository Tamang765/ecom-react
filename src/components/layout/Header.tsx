import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { classNames } from "@/lib/utils";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

const categories = [
  "All categories",
  "Electronics",
  "Fashion",
  "Women's",
  "Men's",
  "Home & Living",
  "Beauty",
  "Groceries",
];

type IconName = "search" | "pin" | "cart" | "user" | "menu" | "close" | "gift";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    cart: (
      <>
        <path d="M3 3h2l2.2 10.5a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13M3 12h18M7.5 8C5 8 4 6.8 4 5.5S5 3 6.5 3C9 3 12 8 12 8m4.5 0C19 8 20 6.8 20 5.5S19 3 17.5 3C15 3 12 8 12 8" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => setMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    navigate(
      query ? `/products?search=${encodeURIComponent(query)}` : "/products",
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="market-container">
        <div className="flex h-[68px] items-center gap-3 lg:h-[76px] lg:gap-7">
          <Link
            to="/"
            className="shrink-0 rounded text-2xl font-black tracking-[-0.07em] text-gray-950"
            aria-label="ecom home"
          >
            <span className="relative">
              ecom<span className="tracking-normal text-[#0077a8]">.</span>
            </span>
          </Link>

          <form
            onSubmit={submitSearch}
            className="relative hidden flex-1 md:block"
            role="search"
          >
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              id="site-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for any product or brand"
              className="h-11 w-full rounded-full border-0 bg-[#f4f6f8] pl-11 pr-14 text-sm text-gray-900 shadow-inner outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#006b9b]"
            />
            <Icon
              name="search"
              className="absolute left-4 top-3 h-5 w-5 text-gray-400"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-[#005c91] text-white transition hover:bg-[#00466f]"
            >
              <Icon name="search" className="h-4 w-4" />
            </button>
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-4">
            <Link
              to="/products"
              className="hidden items-center gap-2 rounded-md px-1 py-2 text-gray-700 hover:text-primary lg:flex"
            >
              <Icon name="pin" className="h-5 w-5" />
              <span className="text-[10px] leading-tight">
                <span className="block text-gray-400">
                  Delivering to London
                </span>
                <strong className="text-gray-800">Update location</strong>
              </span>
            </Link>
            <button
              type="button"
              className="hidden items-center gap-1 rounded-md p-2 text-xs font-bold text-gray-700 hover:bg-gray-50 sm:flex"
              aria-label="Country and currency"
            >
              <span className="text-lg" aria-hidden="true">
                🇬🇧
              </span>{" "}
              GBP
            </button>
            <Link
              to="/cart"
              className="relative flex items-center gap-1 rounded-md p-2 text-gray-700 hover:bg-gray-50 hover:text-primary"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <Icon name="cart" />{" "}
              <span className="hidden text-xs font-semibold xl:inline">
                Cart
              </span>
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="hidden items-center gap-1 rounded-md p-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary sm:flex"
              >
                <Icon name="user" />
                {user?.username}
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-1 rounded-md p-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary sm:flex"
              >
                <Icon name="user" />
                Sign in
              </Link>
            )}
            <button
              type="button"
              className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>

        <nav
          className="hidden h-10 items-center justify-between border-t border-gray-100 lg:flex"
          aria-label="Shop categories"
        >
          <div className="flex h-full items-center gap-5">
            {categories.map((category, index) => (
              <Link
                key={category}
                to="/products"
                className={classNames(
                  "flex h-full items-center gap-1 text-[11px] font-medium text-gray-700 hover:text-primary",
                  index === 0 && "font-bold text-gray-950",
                )}
              >
                {category}
                {index === 0 && <span className="text-[9px]">▾</span>}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <Link
              to="/products"
              className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 hover:text-primary"
            >
              <Icon name="gift" className="h-4 w-4 text-[#006b9b]" />
              Best deals
            </Link>
            <Link
              to="/products"
              className="text-[11px] font-black text-[#006b9b]"
            >
              ecom<span className="font-normal text-gray-900">Live</span>{" "}
              <span className="text-[8px] text-red-500">LIVE</span>
            </Link>
          </div>
        </nav>
      </div>

      <button
        type="button"
        aria-label="Close navigation menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
        className={classNames(
          "fixed inset-0 top-[68px] z-40 bg-gray-950/30 transition-opacity lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        className={classNames(
          "fixed bottom-0 right-0 top-[68px] z-50 w-80 max-w-[88vw] overflow-y-auto border-l border-gray-200 bg-white p-5 shadow-2xl transition-transform lg:hidden",
          menuOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <form onSubmit={submitSearch} className="relative mb-5 md:hidden">
          <label htmlFor="mobile-search" className="sr-only">
            Search products
          </label>
          <input
            id="mobile-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products"
            className="h-11 w-full rounded-full bg-gray-100 pl-11 pr-4 text-sm"
          />
          <Icon
            name="search"
            className="absolute left-4 top-3 h-5 w-5 text-gray-400"
          />
        </form>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Shop
        </p>
        <div className="grid grid-cols-2 gap-1">
          {categories.map((category) => (
            <NavLink
              key={category}
              to="/products"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-primary"
            >
              {category}
            </NavLink>
          ))}
        </div>
        <div className="mt-5 border-t border-gray-200 pt-5">
          {isAuthenticated ? (
            <div className="grid gap-2">
              <Link to="/profile" className="btn btn-secondary">
                Profile
              </Link>
              <Link to="/orders" className="btn btn-secondary">
                Orders
              </Link>
              <Button variant="ghost" onClick={logout}>
                Log out
              </Button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Link to="/login" className="btn btn-secondary">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Create account
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
