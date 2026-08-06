import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoBagHandleOutline, IoHeartOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ProductCard from "../../components/product/ProductCard";
import { addCartItem } from "../../store/cart/cartThunk";
import {
  deleteFavoriteItem,
  fetchFavorites,
} from "../../store/favorite/favoriteThunk";

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") {
    return error;
  }

  return error?.message ?? error?.response?.data?.message ?? fallbackMessage;
};

const FavoritesSkeleton = ({ count = 8 }) => (
  <div className="favorite-grid">
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

const Favorites = () => {
  const dispatch = useDispatch();

  const {
    items = [],
    loading = false,
    actionLoading = false,
    actionProductId = null,
  } = useSelector((state) => state.favorite);

  const cartState = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleRemoveFavorite = async (product) => {
    if (!product?.id || actionLoading) {
      return;
    }

    try {
      const response = await dispatch(deleteFavoriteItem(product.id)).unwrap();

      toast.success(response?.message ?? "Ürün favorilerden çıkarıldı.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Ürün favorilerden çıkarılamadı."));
    }
  };

  const handleAddToCart = async (product) => {
    if (!product?.id) {
      toast.error("Ürün bilgisi bulunamadı.");
      return;
    }

    const stock = Number(product?.stock ?? 0);

    if (stock <= 0) {
      toast.error("Bu ürün stokta bulunmuyor.");
      return;
    }

    const isProductLoading =
      cartState?.actionLoading &&
      Number(cartState?.actionProductId) === Number(product.id);

    if (isProductLoading) {
      return;
    }

    try {
      const response = await dispatch(
        addCartItem({
          productId: product.id,
          quantity: 1,
        }),
      ).unwrap();

      toast.success(response?.message ?? `${product.name} sepete eklendi.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Ürün sepete eklenemedi."));
    }
  };

  if (loading) {
    return (
      <main className="favorite-page">
        <div className="container-custom">
          <div className="favorite-page-header">
            <div>
              <span>Beğendiğin ürünler</span>
              <h1>Favorilerim</h1>
              <p>Favori ürünlerin yükleniyor.</p>
            </div>
          </div>

          <FavoritesSkeleton />
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="favorite-page">
        <div className="container-custom">
          <div className="favorite-empty">
            <div className="favorite-empty-icon">
              <IoHeartOutline />
            </div>

            <h1>Favori listen boş</h1>

            <p>
              Beğendiğin ürünleri favorilerine ekleyerek daha sonra kolayca
              ulaşabilirsin.
            </p>

            <Link to="/products" className="favorite-empty-button">
              <IoBagHandleOutline />
              Ürünleri Keşfet
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="favorite-page">
      <div className="container-custom">
        <div className="favorite-page-header">
          <div>
            <span>Beğendiğin ürünler</span>

            <h1>Favorilerim</h1>

            <p>Favori listende toplam {items.length} ürün var.</p>
          </div>
        </div>

        <div className="favorite-grid">
          {items.map((product) => {
            const cartLoading =
              cartState?.actionLoading &&
              Number(cartState?.actionProductId) === Number(product.id);

            const favoriteLoading =
              actionLoading && Number(actionProductId) === Number(product.id);

            return (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite
                cartLoading={cartLoading}
                favoriteLoading={favoriteLoading}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleRemoveFavorite}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Favorites;
