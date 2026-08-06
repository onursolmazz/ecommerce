import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoCartOutline,
  IoHeart,
  IoHeartOutline,
  IoImageOutline,
  IoStar,
} from "react-icons/io5";
import { toast } from "react-toastify";
import formatPrice from "../../utils/formatPrice";

const STORAGE_URL =
  import.meta.env.VITE_STORAGE_URL ?? "http://127.0.0.1:8000/storage";

const getImageUrl = (path) => {
  if (!path || typeof path !== "string") {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `http://127.0.0.1:8000${path}`;
  }

  if (path.startsWith("/")) {
    return path;
  }

  const normalizedPath = path
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  return `${STORAGE_URL}/${normalizedPath}`;
};

const getPrimaryImage = (product) => {
  const primaryImage = product?.images?.find(
    (image) =>
      image?.is_primary === true ||
      image?.is_primary === 1 ||
      image?.is_primary === "1",
  );

  const imagePath =
    product?.primary_image?.url ??
    product?.primary_image?.path ??
    product?.primary_image?.image ??
    product?.primary_image ??
    primaryImage?.url ??
    primaryImage?.path ??
    primaryImage?.image ??
    product?.images?.[0]?.url ??
    product?.images?.[0]?.path ??
    product?.images?.[0]?.image ??
    product?.image_url ??
    product?.image ??
    null;

  return getImageUrl(imagePath);
};

const ProductCard = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  cartLoading = false,
  favoriteLoading = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const productId = product?.slug ?? product?.id;
  const primaryImage = getPrimaryImage(product);

  const rating = Number(
    product?.average_rating ??
      product?.reviews_avg_rating ??
      product?.rating ??
      0,
  );

  const reviewCount = Number(
    product?.reviews_count ?? product?.review_count ?? 0,
  );

  const stock = Number(product?.stock ?? 0);
  const price = Number(product?.price ?? 0);
  const oldPrice = Number(product?.old_price ?? 0);

  const discountPercentage = Number(
    product?.discount_percentage ??
      (oldPrice > price && oldPrice > 0
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : 0),
  );

  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Bu ürün stokta bulunmuyor.");
      return;
    }

    onAddToCart?.(product);
  };

  const handleFavorite = () => {
    onToggleFavorite?.(product);
  };

  return (
    <article className="product-card">
      <div className="product-card-image-wrapper">
        <Link
          to={`/products/${productId}`}
          className="product-card-image-link"
          aria-label={`${product?.name ?? "Ürün"} detayını görüntüle`}
        >
          {!imageError && primaryImage ? (
            <img
              src={primaryImage}
              alt={product?.name ?? "Ürün"}
              className="product-card-image"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="product-card-placeholder">
              <IoImageOutline />
              <span>Görsel bulunamadı</span>
            </div>
          )}
        </Link>

        <button
          type="button"
          className={["product-favorite-button", isFavorite ? "active" : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={handleFavorite}
          disabled={favoriteLoading}
          aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          aria-pressed={isFavorite}
        >
          {isFavorite ? <IoHeart /> : <IoHeartOutline />}
        </button>

        {discountPercentage > 0 && (
          <span className="product-discount-badge">%{discountPercentage}</span>
        )}

        {isOutOfStock && <span className="product-stock-badge">Tükendi</span>}
      </div>

      <div className="product-card-body">
        {product?.category?.name && (
          <Link
            to={`/products?category=${
              product.category.slug ?? product.category.id
            }`}
            className="product-card-category"
          >
            {product.category.name}
          </Link>
        )}

        <Link to={`/products/${productId}`} className="product-card-title">
          {product?.name ?? "İsimsiz ürün"}
        </Link>

        <div
          className="product-card-rating"
          aria-label={`${rating.toFixed(1)} puan, ${reviewCount} yorum`}
        >
          <IoStar />
          <span>{rating.toFixed(1)}</span>
          <small>({reviewCount})</small>
        </div>

        <div className="product-card-bottom">
          <div className="product-card-price-wrapper">
            {oldPrice > price && (
              <span className="product-old-price">{formatPrice(oldPrice)}</span>
            )}

            <strong className="product-card-price">{formatPrice(price)}</strong>
          </div>

          <button
            type="button"
            className="product-cart-button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartLoading}
            aria-label={isOutOfStock ? "Ürün stokta bulunmuyor" : "Sepete ekle"}
          >
            {cartLoading ? (
              <span
                className="spinner-border spinner-border-sm"
                aria-hidden="true"
              />
            ) : (
              <IoCartOutline />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
