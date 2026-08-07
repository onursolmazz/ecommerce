import type {
  Product,
  ProductImage,
} from "../types";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ??
  "http://192.168.1.102:8000";

const STORAGE_URL = `${BACKEND_URL}/storage`;

const extractImagePath = (
  image: ProductImage | string | null | undefined,
): string | null => {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return image;
  }

  return (
    image.url ??
    image.image_url ??
    image.path ??
    image.image ??
    null
  );
};

const isPrimaryImage = (image: ProductImage): boolean => {
  return (
    image.is_primary === true ||
    image.is_primary === 1 ||
    image.is_primary === "1"
  );
};

const normalizeAbsoluteUrl = (value: string): string => {
  return value
    .replace("http://127.0.0.1:8000", BACKEND_URL)
    .replace("http://localhost:8000", BACKEND_URL);
};

const getImageUrl = (product: Product): string | null => {
  const images = Array.isArray(product.images)
    ? product.images
    : [];

  const primaryFromImages = images.find(isPrimaryImage);

  const value =
    extractImagePath(product.primary_image) ??
    extractImagePath(primaryFromImages) ??
    extractImagePath(images[0]) ??
    product.image_url ??
    product.image ??
    null;

  if (!value || typeof value !== "string") {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return normalizeAbsoluteUrl(value);
  }

  if (value.startsWith("/storage/")) {
    return `${BACKEND_URL}${value}`;
  }

  if (value.startsWith("/")) {
    return `${BACKEND_URL}${value}`;
  }

  const normalizedPath = value
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  return `${STORAGE_URL}/${normalizedPath}`;
};

export default getImageUrl;