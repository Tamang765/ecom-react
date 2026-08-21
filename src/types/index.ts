export type Id = string;
export type Money = string;

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface User {
  id: Id;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface Product {
  id: Id;
  name: string;
  description: string | null;
  price: Money;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: Id;
  name: string;
  price: Money;
  stock: number;
  quantity: number;
  lineTotal: Money;
}

export interface Cart {
  id: Id | null;
  userId: Id;
  items: CartItem[];
  total: Money;
}

export type OrderStatus = 'placed' | 'cancelled';

export interface OrderSummary {
  id: Id;
  userId: Id;
  status: OrderStatus;
  total: Money;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: Id;
  productName: string;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
}

export interface OrderDetail {
  id: Id;
  userId: Id;
  status: OrderStatus;
  total: Money;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  total: Money;
  isLoading: boolean;
  error: string | null;
  addItem: (productId: Id, quantity?: number) => Promise<void>;
  updateItem: (productId: Id, quantity: number) => Promise<void>;
  removeItem: (productId: Id) => Promise<void>;
  refreshCart: () => Promise<void>;
  resetCart: () => void;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (update: UserUpdate) => Promise<User>;
  deleteAccount: () => Promise<void>;
}
