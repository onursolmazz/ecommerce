import ProductCard from "./ProductCard";

const ProductGridSkeleton = ({ count = 12 }) => {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="product-card-skeleton">
          <div className="skeleton product-card-skeleton-image" />

          <div className="product-card-skeleton-body">
            <div className="skeleton skeleton-line skeleton-line-sm" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-line-md" />
            <div className="skeleton skeleton-line skeleton-line-xs" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ProductGrid = ({
  products = [],
  loading = false,
  onAddToCart,
  onToggleFavorite,
  favoriteIds = [],
  cartLoadingId = null,
  favoriteLoadingId = null,
}) => {
  if (loading) {
    return <ProductGridSkeleton />;
  }

  if (!products.length) {
    return (
      <div className="product-grid-empty">
        <h3>Ürün bulunamadı</h3>
        <p>Filtreleri değiştirerek tekrar deneyebilirsin.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favoriteIds.includes(product.id)}
          cartLoading={cartLoadingId === product.id}
          favoriteLoading={favoriteLoadingId === product.id}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
