import api from "./axios";

import type {
  ProductResponse,
  ProductsResponse,
} from "../types";

export type ProductParams = {
  search?: string;
  status?: boolean | number;
  category_id?: number;
  per_page?: number;
  page?: number;
  sort?: string;
};

export const getProducts = (
  params: ProductParams = {},
) => {
  return api.get<ProductsResponse>("/products", {
    params,
  });
};

export const getProduct = (
  idOrSlug: number | string,
) => {
  return api.get<ProductResponse>(
    `/products/${encodeURIComponent(String(idOrSlug))}`,
  );
};