export type ApiErrorResponse = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export type UserRole = {
  id?: number;
  name?: string;
  slug?: string;
};

export type User = {
  id: number;
  role_id?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  role?: UserRole | string | null;
};

export type ProductCategory = {
  id?: number;
  name?: string;
  slug?: string;
  image?: string | null;
};

export type ProductSeller = {
  id?: number;
  name?: string;
};

export type ProductImage = {
  id?: number;
  image?: string | null;
  path?: string | null;
  url?: string | null;
  image_url?: string | null;
  is_primary?: boolean | number | string;
};

export type Product = {
  id: number;
  category_id?: number | null;
  seller_id?: number | null;

  name: string;
  slug?: string;
  description?: string | null;

  price: number | string;
  stock: number | string;
  status?: boolean | number | string;

  average_rating?: number | string;
  reviews_avg_rating?: number | string;
  rating?: number | string;
  reviews_count?: number | string;

  image?: string | null;
  image_url?: string | null;

  primary_image?: ProductImage | string | null;
  images?: ProductImage[];

  category?: ProductCategory | null;
  seller?: ProductSeller | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message?: string;
  token: string;
  user: User;
};

export type MeResponse = {
  success: boolean;
  message?: string;
  user: User;
};

export type LogoutResponse = {
  success: boolean;
  message?: string;
};

export type PaginationMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
};

export type ProductsResponse = {
  success?: boolean;
  message?: string;
  data?: Product[];
  products?: Product[];
  meta?: PaginationMeta;
};

export type ProductResponse = {
  success?: boolean;
  message?: string;
  data?: Product;
};