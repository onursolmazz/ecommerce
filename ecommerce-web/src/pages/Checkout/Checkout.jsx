import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IoArrowBackOutline,
  IoBagCheckOutline,
  IoCardOutline,
  IoCheckmarkCircleOutline,
  IoCubeOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoPhonePortraitOutline,
  IoReceiptOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createOrder } from "../../api/orderApi";
import { fetchCart } from "../../store/cart/cartThunk";
import formatPrice from "../../utils/formatPrice";

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
    image.startsWith("blob:") ||
    image.startsWith("data:")
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

const extractOrder = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") {
    return error;
  }

  return error?.message ?? error?.response?.data?.message ?? fallbackMessage;
};

const CheckoutSkeleton = () => (
  <main className="checkout-page">
    <div className="container-custom">
      <div className="checkout-page-header">
        <div className="checkout-skeleton-heading">
          <div className="skeleton skeleton-line skeleton-line-sm" />
          <div className="skeleton skeleton-line skeleton-line-md" />
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-content">
          <div className="skeleton checkout-skeleton-section" />
          <div className="skeleton checkout-skeleton-section" />
        </div>

        <div className="skeleton checkout-skeleton-summary" />
      </div>
    </div>
  </main>
);

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items = [],
    totalQuantity = 0,
    totalPrice = 0,
    loading: cartLoading = false,
  } = useSelector((state) => state.cart);

  const user = useSelector((state) => state.auth?.user);

  const [formData, setFormData] = useState({
    shipping_name: user?.name ?? "",
    shipping_phone: user?.phone ?? "",
    shipping_city: user?.city ?? "",
    shipping_district: user?.district ?? "",
    shipping_address: user?.address ?? "",
    shipping_note: "",
    payment_method: "cash_on_delivery",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: null,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.shipping_name.trim()) {
      nextErrors.shipping_name = "Teslim alacak kişinin adı zorunludur.";
    }

    if (!formData.shipping_phone.trim()) {
      nextErrors.shipping_phone = "Telefon numarası zorunludur.";
    } else if (formData.shipping_phone.replace(/\D/g, "").length < 10) {
      nextErrors.shipping_phone = "Geçerli bir telefon numarası girin.";
    }

    if (!formData.shipping_city.trim()) {
      nextErrors.shipping_city = "Şehir zorunludur.";
    }

    if (!formData.shipping_district.trim()) {
      nextErrors.shipping_district = "İlçe zorunludur.";
    }

    if (formData.shipping_address.trim().length < 10) {
      nextErrors.shipping_address =
        "Teslimat adresi en az 10 karakter olmalıdır.";
    }

    if (!formData.payment_method) {
      nextErrors.payment_method = "Ödeme yöntemi seçmelisiniz.";
    }

    if (!formData.terms) {
      nextErrors.terms = "Ön bilgilendirme koşullarını kabul etmelisiniz.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!items.length) {
      toast.error("Sepetiniz boş.");
      navigate("/cart");
      return;
    }

    const invalidCartItem = items.find((item) => {
      const stock = Number(item?.product?.stock ?? 0);
      const quantity = Number(item?.quantity ?? 0);

      return (
        !item?.product ||
        item?.product?.status === false ||
        stock <= 0 ||
        quantity > stock
      );
    });

    if (invalidCartItem) {
      toast.error("Sepetinizde stok durumu uygun olmayan ürünler var.");
      navigate("/cart");
      return;
    }

    if (!validate()) {
      toast.error("Lütfen teslimat bilgilerini kontrol edin.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await createOrder({
        shipping_name: formData.shipping_name.trim(),
        shipping_phone: formData.shipping_phone.trim(),
        shipping_city: formData.shipping_city.trim(),
        shipping_district: formData.shipping_district.trim(),
        shipping_address: formData.shipping_address.trim(),
        shipping_note: formData.shipping_note.trim(),
        payment_method: formData.payment_method,
      });

      const order = extractOrder(response);

      await dispatch(fetchCart()).unwrap();

      toast.success(
        response?.data?.message ?? "Siparişiniz başarıyla oluşturuldu.",
      );

      if (order?.id) {
        navigate(`/order-success/${order.id}`, {
          replace: true,
          state: {
            order,
          },
        });

        return;
      }

      navigate("/orders", {
        replace: true,
      });
    } catch (error) {
      const validationErrors = error?.response?.data?.errors ?? null;

      if (validationErrors) {
        const normalizedErrors = {};

        Object.entries(validationErrors).forEach(([field, messages]) => {
          normalizedErrors[field] = Array.isArray(messages)
            ? messages[0]
            : messages;
        });

        setErrors((current) => ({
          ...current,
          ...normalizedErrors,
        }));
      }

      toast.error(getErrorMessage(error, "Sipariş oluşturulamadı."));
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading) {
    return <CheckoutSkeleton />;
  }

  if (!items.length) {
    return (
      <main className="checkout-page">
        <div className="container-custom">
          <div className="checkout-empty">
            <div className="checkout-empty-icon">
              <IoCubeOutline />
            </div>

            <h1>Sepetiniz boş</h1>

            <p>Sipariş oluşturmak için önce sepetinize ürün eklemelisiniz.</p>

            <Link to="/products" className="checkout-empty-button">
              Ürünleri Keşfet
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="container-custom">
        <button
          type="button"
          className="checkout-back-button"
          onClick={() => navigate("/cart")}
        >
          <IoArrowBackOutline />
          Sepete Dön
        </button>

        <div className="checkout-page-header">
          <div>
            <span>Güvenli ödeme</span>

            <h1>Siparişi Tamamla</h1>

            <p>Teslimat bilgilerinizi kontrol ederek siparişinizi oluşturun.</p>
          </div>
        </div>

        <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
          <div className="checkout-content">
            <section className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">
                  <IoLocationOutline />
                </div>

                <div>
                  <h2>Teslimat Bilgileri</h2>
                  <p>Siparişinizin teslim edileceği adresi girin.</p>
                </div>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-form-group">
                  <label htmlFor="shipping_name">Ad Soyad</label>

                  <div className="checkout-input-wrapper">
                    <IoPersonOutline />

                    <input
                      id="shipping_name"
                      name="shipping_name"
                      type="text"
                      value={formData.shipping_name}
                      onChange={handleChange}
                      placeholder="Adınız ve soyadınız"
                      className={errors.shipping_name ? "is-invalid" : ""}
                    />
                  </div>

                  {errors.shipping_name && (
                    <span className="checkout-form-error">
                      {errors.shipping_name}
                    </span>
                  )}
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="shipping_phone">Telefon</label>

                  <div className="checkout-input-wrapper">
                    <IoPhonePortraitOutline />

                    <input
                      id="shipping_phone"
                      name="shipping_phone"
                      type="tel"
                      value={formData.shipping_phone}
                      onChange={handleChange}
                      placeholder="05XX XXX XX XX"
                      className={errors.shipping_phone ? "is-invalid" : ""}
                    />
                  </div>

                  {errors.shipping_phone && (
                    <span className="checkout-form-error">
                      {errors.shipping_phone}
                    </span>
                  )}
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="shipping_city">Şehir</label>

                  <input
                    id="shipping_city"
                    name="shipping_city"
                    type="text"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    placeholder="Şehir"
                    className={errors.shipping_city ? "is-invalid" : ""}
                  />

                  {errors.shipping_city && (
                    <span className="checkout-form-error">
                      {errors.shipping_city}
                    </span>
                  )}
                </div>

                <div className="checkout-form-group">
                  <label htmlFor="shipping_district">İlçe</label>

                  <input
                    id="shipping_district"
                    name="shipping_district"
                    type="text"
                    value={formData.shipping_district}
                    onChange={handleChange}
                    placeholder="İlçe"
                    className={errors.shipping_district ? "is-invalid" : ""}
                  />

                  {errors.shipping_district && (
                    <span className="checkout-form-error">
                      {errors.shipping_district}
                    </span>
                  )}
                </div>

                <div className="checkout-form-group checkout-form-full">
                  <label htmlFor="shipping_address">Açık Adres</label>

                  <textarea
                    id="shipping_address"
                    name="shipping_address"
                    rows="5"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="Mahalle, cadde, sokak, bina ve daire bilgileri"
                    className={errors.shipping_address ? "is-invalid" : ""}
                  />

                  {errors.shipping_address && (
                    <span className="checkout-form-error">
                      {errors.shipping_address}
                    </span>
                  )}
                </div>

                <div className="checkout-form-group checkout-form-full">
                  <label htmlFor="shipping_note">Sipariş Notu</label>

                  <textarea
                    id="shipping_note"
                    name="shipping_note"
                    rows="3"
                    value={formData.shipping_note}
                    onChange={handleChange}
                    placeholder="Teslimatla ilgili eklemek istediğiniz not"
                  />
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">
                  <IoCardOutline />
                </div>

                <div>
                  <h2>Ödeme Yöntemi</h2>
                  <p>Kullanmak istediğiniz ödeme yöntemini seçin.</p>
                </div>
              </div>

              <div className="checkout-payment-methods">
                <label
                  className={[
                    "checkout-payment-card",
                    formData.payment_method === "cash_on_delivery"
                      ? "active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={formData.payment_method === "cash_on_delivery"}
                    onChange={handleChange}
                  />

                  <div className="checkout-payment-icon">
                    <IoReceiptOutline />
                  </div>

                  <div>
                    <strong>Kapıda Ödeme</strong>

                    <span>Siparişinizi teslim alırken ödeyin.</span>
                  </div>

                  <IoCheckmarkCircleOutline className="checkout-payment-check" />
                </label>

                <label
                  className={[
                    "checkout-payment-card",
                    formData.payment_method === "credit_card" ? "active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="credit_card"
                    checked={formData.payment_method === "credit_card"}
                    onChange={handleChange}
                  />

                  <div className="checkout-payment-icon">
                    <IoCardOutline />
                  </div>

                  <div>
                    <strong>Kredi veya Banka Kartı</strong>

                    <span>Güvenli ödeme altyapısıyla ödeme yapın.</span>
                  </div>

                  <IoCheckmarkCircleOutline className="checkout-payment-check" />
                </label>
              </div>

              {errors.payment_method && (
                <span className="checkout-form-error">
                  {errors.payment_method}
                </span>
              )}
            </section>

            <section className="checkout-section">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">
                  <IoCubeOutline />
                </div>

                <div>
                  <h2>Sipariş Ürünleri</h2>

                  <p>Sepetinizde {totalQuantity} ürün bulunuyor.</p>
                </div>
              </div>

              <div className="checkout-products">
                {items.map((item) => {
                  const product = item?.product;
                  const quantity = Number(item?.quantity ?? 0);
                  const price = Number(product?.price ?? 0);
                  const imageUrl = getImageUrl(product);

                  return (
                    <article key={item.id} className="checkout-product">
                      <div className="checkout-product-image">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product?.name ?? "Ürün"} />
                        ) : (
                          <IoCubeOutline />
                        )}
                      </div>

                      <div className="checkout-product-info">
                        {product?.category?.name && (
                          <span>{product.category.name}</span>
                        )}

                        <strong>{product?.name ?? "Ürün"}</strong>

                        <small>{quantity} adet</small>
                      </div>

                      <div className="checkout-product-price">
                        <span>
                          {formatPrice(price)} × {quantity}
                        </span>

                        <strong>{formatPrice(price * quantity)}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="checkout-summary">
            <div className="checkout-summary-icon">
              <IoBagCheckOutline />
            </div>

            <h2>Sipariş Özeti</h2>

            <div className="checkout-summary-row">
              <span>Ürün adedi</span>
              <strong>{totalQuantity}</strong>
            </div>

            <div className="checkout-summary-row">
              <span>Ara toplam</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <div className="checkout-summary-row">
              <span>Kargo</span>

              <strong className="checkout-free-shipping">Ücretsiz</strong>
            </div>

            <div className="checkout-summary-total">
              <span>Toplam</span>

              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <label className="checkout-terms">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
              />

              <span>
                Ön bilgilendirme formunu ve mesafeli satış sözleşmesini okudum,
                kabul ediyorum.
              </span>
            </label>

            {errors.terms && (
              <span className="checkout-form-error">{errors.terms}</span>
            )}

            <button
              type="submit"
              className="checkout-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  />
                  Sipariş Oluşturuluyor...
                </>
              ) : (
                <>
                  <IoBagCheckOutline />
                  Siparişi Onayla
                </>
              )}
            </button>

            <div className="checkout-security-note">
              <IoShieldCheckmarkOutline />

              <span>Sipariş bilgileriniz güvenli şekilde işlenmektedir.</span>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
