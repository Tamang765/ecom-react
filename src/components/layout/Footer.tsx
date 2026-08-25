import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link
              to="/"
              className="inline-flex rounded text-2xl font-black tracking-[-0.07em] text-gray-950"
              aria-label="ecom home"
            >
              ecom<span className="tracking-normal text-[#0077a8]">.</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
              Everything you love, all in one place. Discover daily deals,
              trusted products and a checkout that keeps things simple.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Shop</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/products"
                  className="rounded text-sm text-gray-500 hover:text-primary"
                >
                  All products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="rounded text-sm text-gray-500 hover:text-primary"
                >
                  Shopping cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Account</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  to="/profile"
                  className="rounded text-sm text-gray-500 hover:text-primary"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="rounded text-sm text-gray-500 hover:text-primary"
                >
                  Order history
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ecom. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
