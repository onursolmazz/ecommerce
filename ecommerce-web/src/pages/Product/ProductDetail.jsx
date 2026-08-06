import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IoAddOutline,
  IoCartOutline,
  IoHeart,
  IoHeartOutline,
  IoRemoveOutline,
  IoShieldCheckmarkOutline,
  IoStorefrontOutline,
} from "react-icons/io5";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProduct } from "../../api/productApi";
import ProductGallery from "../../components/product/ProductGallery";
import ProductPrice from "../../components/product/ProductPrice";
import ProductRating from "../../components/product/ProductRating";
import { addCartItem } from "../../store/cart/cartThunk";
import {
  addFavoriteItem,
  deleteFavoriteItem,
} from "../../store/favorite/favoriteThunk";

const extractProduct = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") {
    return error;
  }

  return error?.message ?? error?.response?.data?.message ?? fallbackMessage;
};

const ProductDetailSkeleton = () => (
  <main className="product-detail-page">
    <div className="container-custom">
      <div className="product-detail-skeleton">
        <div className="skeleton product-detail-skeleton-gallery" />

        <div className="product-detail-skeleton-info">
          <div className="skeleton skeleton-line skeleton-line-sm" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line-md" />
          <div className="skeleton skeleton-line skeleton-line-xs" />
          <div className="skeleton skeleton-block" />
        </div>
      </div>
    </div>
  </main>
);

const ProductDetail = () => {
  const { slug } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  const cartState = useSelector((state) => state.cart);
  const favoriteState = useSelector((state) => state.favorite);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loadedSlug, setLoadedSlug] = useState(null);

  const loading = loadedSlug !== slug;

  const favoriteItems = Array.isArray(favoriteState?.items)
    ? favoriteState.items
    : [];

  const existsInFavorites = favoriteItems.some(
    (item) => Number(item?.id ?? item?.product_id) === Number(product?.id),
  );

  const isFavorite = existsInFavorites || Boolean(product?.is_favorite);

  const cartLoading =
    cartState?.actionLoading &&
    Number(cartState?.actionProductId) === Number(product?.id);

  const favoriteLoading =
    favoriteState?.actionLoading &&
    Number(favoriteState?.actionProductId) === Number(product?.id);

  useEffect(() => {
    if (!slug) {
      return undefined;
    }

    let active = true;

    const loadProduct = async () => {
      try {
        const response = await getProduct(slug);

        if (!active) {
          return;
        }

        const productData = extractProduct(response);

        setProduct(productData);
        setQuantity(1);
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("Ürün detay hatası:", error?.response?.data ?? error);

        toast.error(getErrorMessage(error, "Ürün bilgileri yüklenemedi."));

        setProduct(null);
      } finally {
        if (active) {
          setLoadedSlug(slug);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  const stock = Number(product?.stock ?? 0);

  const rating = Number(
    product?.average_rating ??
      product?.reviews_avg_rating ??
      product?.rating ??
      0,
  );

  const reviewCount = Number(
    product?.reviews_count ?? product?.review_count ?? 0,
  );

  const images = Array.isArray(product?.images) ? product.images : [];

  const redirectToLogin = () => {
    toast.info("Bu işlemi yapabilmek için giriş yapmalısınız.");

    navigate("/login", {
      state: {
        from: location,
      },
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(stock, current + 1));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (!product?.id) {
      toast.error("Ürün bilgisi bulunamadı.");
      return;
    }

    if (stock <= 0) {
      toast.error("Bu ürün stokta bulunmuyor.");
      return;
    }

    if (cartLoading) {
      return;
    }

    try {
      const response = await dispatch(
        addCartItem({
          productId: product.id,
          quantity,
        }),
      ).unwrap();

      toast.success(
        response?.message ?? `${quantity} adet ${product.name} sepete eklendi.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Ürün sepete eklenemedi."));
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    if (!product?.id || favoriteLoading) {
      return;
    }

    try {
      if (isFavorite) {
        const response = await dispatch(
          deleteFavoriteItem(product.id),
        ).unwrap();

        setProduct((currentProduct) =>
          currentProduct
            ? {
                ...currentProduct,
                is_favorite: false,
              }
            : currentProduct,
        );

        toast.success(response?.message ?? "Ürün favorilerden çıkarıldı.");

        return;
      }

      const response = await dispatch(addFavoriteItem(product.id)).unwrap();

      setProduct((currentProduct) =>
        currentProduct
          ? {
              ...currentProduct,
              is_favorite: true,
            }
          : currentProduct,
      );

      toast.success(response?.message ?? "Ürün favorilere eklendi.");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          isFavorite
            ? "Ürün favorilerden çıkarılamadı."
            : "Ürün favorilere eklenemedi.",
        ),
      );
    }
  };

  if (!slug) {
    return (
      <main className="product-detail-page">
        <div className="container-custom">
          <div className="product-detail-empty">
            <h1>Geçersiz ürün adresi</h1>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <main className="product-detail-page">
        <div className="container-custom">
          <div className="product-detail-empty">
            <h1>Ürün bulunamadı</h1>

            <p>Aradığınız ürün kaldırılmış veya mevcut olmayabilir.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <div className="container-custom">
        <div className="product-detail-layout">
          <ProductGallery
            images={images}
            primaryImage={product.primary_image}
            productName={product.name}
          />

          <section className="product-detail-info">
            <div className="product-detail-top">
              {product?.category?.name && (
                <span className="product-detail-category">
                  {product.category.name}
                </span>
              )}

              <h1>{product.name}</h1>

              <ProductRating rating={rating} reviewCount={reviewCount} />

              <ProductPrice product={product} />
            </div>

            {product?.seller?.name && (
              <div className="product-detail-seller">
                <IoStorefrontOutline />

                <div>
                  <span>Satıcı</span>
                  <strong>{product.seller.name}</strong>
                </div>
              </div>
            )}

            <div className="product-detail-description">
              <h2>Ürün Açıklaması</h2>

              <p>
                {product?.description ?? "Bu ürün için açıklama bulunmuyor."}
              </p>
            </div>

            <div
              className={[
                "product-detail-stock",
                stock <= 0 ? "out-of-stock" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <IoShieldCheckmarkOutline />

              <span>
                {stock > 0
                  ? `Stokta ${stock} adet ürün var`
                  : "Ürün stokta bulunmuyor"}
              </span>
            </div>

            <div className="product-detail-benefits">
              <div className="product-detail-benefit">
                <IoShieldCheckmarkOutline />
                <span>Güvenli alışveriş</span>
              </div>

              <div className="product-detail-benefit">
                <IoStorefrontOutline />
                <span>Güvenilir satıcı</span>
              </div>

              <div className="product-detail-benefit">
                <IoCartOutline />
                <span>Hızlı teslimat</span>
              </div>
            </div>

            <div className="product-detail-purchase">
              <div className="product-quantity">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Adedi azalt"
                >
                  <IoRemoveOutline />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={stock <= 0 || quantity >= stock}
                  aria-label="Adedi artır"
                >
                  <IoAddOutline />
                </button>
              </div>

              <button
                type="button"
                className="product-detail-cart-button"
                onClick={handleAddToCart}
                disabled={stock <= 0 || cartLoading}
              >
                {cartLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  />
                ) : (
                  <IoCartOutline />
                )}

                {cartLoading ? "Ekleniyor..." : "Sepete Ekle"}
              </button>

              <button
                type="button"
                className={[
                  "product-detail-favorite-button",
                  isFavorite ? "active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={handleFavorite}
                disabled={favoriteLoading}
                aria-label={
                  isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"
                }
                aria-pressed={isFavorite}
              >
                {favoriteLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  />
                ) : isFavorite ? (
                  <IoHeart />
                ) : (
                  <IoHeartOutline />
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
