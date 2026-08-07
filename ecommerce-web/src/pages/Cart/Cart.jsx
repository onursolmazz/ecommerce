import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IoAddOutline,
  IoBagHandleOutline,
  IoCartOutline,
  IoRemoveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import formatPrice from "../../utils/formatPrice";
import {
  deleteAllCartItems,
  deleteCartItem,
  fetchCart,
  updateCartItem,
} from "../../store/cart/cartThunk";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ??
  "https://ecommerce-w7ko.onrender.com";
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? `${API_URL}/storage`;

const getImageUrl = (product) => {
  const image =
    product?.primary_image?.url ??
    product?.primary_image?.image ??
    product?.images?.find(
      (item) =>
        item?.is_primary === true ||
        item?.is_primary === 1 ||
        item?.is_primary === "1",
    )?.url ??
    product?.images?.[0]?.url ??
    product?.images?.[0]?.image ??
    null;

  if (!image || typeof image !== "string") {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  if (image.startsWith("/storage/")) {
    return `${API_URL}${image}`;
  }

  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  const normalizedPath = image
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  return `${STORAGE_URL}/${normalizedPath}`;
};

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") {
    return error;
  }

  return error?.message ?? error?.response?.data?.message ?? fallbackMessage;
};

const CartSkeleton = () => (
  <div className="cart-layout">
    <div className="cart-items">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="cart-item cart-item-skeleton">
          <div className="skeleton cart-skeleton-image" />

          <div className="cart-skeleton-content">
            <div className="skeleton skeleton-line skeleton-line-sm" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-line-md" />
          </div>
        </div>
      ))}
    </div>

    <div className="cart-summary">
      <div className="skeleton skeleton-line skeleton-line-md" />
      <div className="skeleton skeleton-block" />
    </div>
  </div>
);

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items = [],
    totalQuantity = 0,
    totalPrice = 0,
    loading = false,
    actionLoading = false,
  } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = async (cartItem, nextQuantity) => {
    const stock = Number(cartItem?.product?.stock ?? 0);

    if (nextQuantity < 1) {
      return;
    }

    if (nextQuantity > stock) {
      toast.error(`En fazla ${stock} adet seçebilirsiniz.`);
      return;
    }

    try {
      await dispatch(
        updateCartItem({
          cartItemId: cartItem.id,
          quantity: nextQuantity,
        }),
      ).unwrap();
    } catch (error) {
      toast.error(getErrorMessage(error, "Sepet güncellenemedi."));
    }
  };

  const handleRemove = async (cartItem) => {
    try {
      const response = await dispatch(deleteCartItem(cartItem.id)).unwrap();

      toast.success(response?.message ?? "Ürün sepetten kaldırıldı.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Ürün sepetten kaldırılamadı."));
    }
  };

  const handleClear = async () => {
    if (!items.length || actionLoading) {
      return;
    }

    const confirmed = window.confirm("Sepetteki tüm ürünler kaldırılsın mı?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await dispatch(deleteAllCartItems()).unwrap();

      toast.success(response?.message ?? "Sepet temizlendi.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Sepet temizlenemedi."));
    }
  };

  const handleCheckout = () => {
    if (!items.length) {
      toast.error("Sepetiniz boş.");
      return;
    }

    const hasUnavailableProduct = items.some((cartItem) => {
      const product = cartItem?.product;
      const stock = Number(product?.stock ?? 0);
      const quantity = Number(cartItem?.quantity ?? 0);

      return (
        !product || product?.status === false || stock <= 0 || quantity > stock
      );
    });

    if (hasUnavailableProduct) {
      toast.error(
        "Sepetinizde stok veya satış durumu uygun olmayan ürünler var.",
      );
      return;
    }

    navigate("/checkout");
  };

  if (loading) {
    return (
      <main className="cart-page">
        <div className="container-custom">
          <CartSkeleton />
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="cart-page">
        <div className="container-custom">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <IoCartOutline />
            </div>

            <h1>Sepetin boş</h1>

            <p>
              Beğendiğin ürünleri sepete ekleyerek alışverişe başlayabilirsin.
            </p>

            <Link to="/products" className="cart-empty-button">
              <IoBagHandleOutline />
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container-custom">
        <div className="cart-page-header">
          <div>
            <span>Alışveriş sepetim</span>

            <h1>Sepetim</h1>

            <p>Sepetinde toplam {totalQuantity} ürün var.</p>
          </div>

          <button
            type="button"
            className="cart-clear-button"
            onClick={handleClear}
            disabled={actionLoading}
          >
            <IoTrashOutline />
            Sepeti Temizle
          </button>
        </div>

        <div className="cart-layout">
          <section className="cart-items">
            {items.map((cartItem) => {
              const product = cartItem?.product;

              const quantity = Number(cartItem?.quantity ?? 1);

              const price = Number(product?.price ?? 0);

              const stock = Number(product?.stock ?? 0);

              const imageUrl = getImageUrl(product);

              const productPath = product?.slug
                ? `/products/${product.slug}`
                : `/products/${product?.id}`;

              return (
                <article key={cartItem.id} className="cart-item">
                  <Link to={productPath} className="cart-item-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product?.name ?? "Ürün"} />
                    ) : (
                      <IoBagHandleOutline />
                    )}
                  </Link>

                  <div className="cart-item-content">
                    <div className="cart-item-info">
                      {product?.category?.name && (
                        <span className="cart-item-category">
                          {product.category.name}
                        </span>
                      )}

                      <Link to={productPath} className="cart-item-name">
                        {product?.name ?? "Ürün"}
                      </Link>

                      <span
                        className={["cart-item-stock", stock <= 0 ? "out" : ""]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {stock > 0 ? `${stock} adet stokta` : "Stokta yok"}
                      </span>
                    </div>

                    <div className="cart-item-controls">
                      <div className="cart-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(cartItem, quantity - 1)
                          }
                          disabled={actionLoading || quantity <= 1}
                          aria-label="Adedi azalt"
                        >
                          <IoRemoveOutline />
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(cartItem, quantity + 1)
                          }
                          disabled={
                            actionLoading || stock <= 0 || quantity >= stock
                          }
                          aria-label="Adedi artır"
                        >
                          <IoAddOutline />
                        </button>
                      </div>

                      <div className="cart-item-price">
                        <span>
                          {formatPrice(price)} × {quantity}
                        </span>

                        <strong>{formatPrice(price * quantity)}</strong>
                      </div>

                      <button
                        type="button"
                        className="cart-item-remove"
                        onClick={() => handleRemove(cartItem)}
                        disabled={actionLoading}
                        aria-label="Ürünü sepetten kaldır"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary">
            <h2>Sipariş Özeti</h2>

            <div className="cart-summary-row">
              <span>Ürünler</span>
              <strong>{totalQuantity} adet</strong>
            </div>

            <div className="cart-summary-row">
              <span>Ara toplam</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <div className="cart-summary-row">
              <span>Kargo</span>

              <strong className="cart-free-shipping">Ücretsiz</strong>
            </div>

            <div className="cart-summary-total">
              <span>Toplam</span>

              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <button
              type="button"
              className="cart-checkout-button"
              onClick={handleCheckout}
              disabled={actionLoading}
            >
              Siparişi Tamamla
            </button>

            <Link to="/products" className="cart-continue-link">
              Alışverişe devam et
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
