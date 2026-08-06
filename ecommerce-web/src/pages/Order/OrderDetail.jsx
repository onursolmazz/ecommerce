import { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
  IoBagCheckOutline,
  IoCheckmarkCircleOutline,
  IoCubeOutline,
  IoLocationOutline,
  IoReceiptOutline,
  IoStorefrontOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrder } from "../../api/orderApi";
import formatDate from "../../utils/formatDate";
import formatPrice from "../../utils/formatPrice";

const STATUS_CONFIG = {
  pending: {
    label: "Bekliyor",
    className: "pending",
    step: 1,
  },
  confirmed: {
    label: "Onaylandı",
    className: "confirmed",
    step: 2,
  },
  preparing: {
    label: "Hazırlanıyor",
    className: "preparing",
    step: 3,
  },
  shipped: {
    label: "Kargoda",
    className: "shipped",
    step: 4,
  },
  delivered: {
    label: "Teslim Edildi",
    className: "delivered",
    step: 5,
  },
  cancelled: {
    label: "İptal Edildi",
    className: "cancelled",
    step: 0,
  },
};

const API_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? `${API_URL}/storage`;

const extractOrder = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

const getStatus = (status) =>
  STATUS_CONFIG[status] ?? {
    label: status ?? "Bilinmiyor",
    className: "default",
    step: 0,
  };

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

const OrderDetailSkeleton = () => (
  <main className="order-detail-page">
    <div className="container-custom">
      <div className="order-detail-skeleton-header">
        <div className="skeleton skeleton-line skeleton-line-sm" />
        <div className="skeleton skeleton-line skeleton-line-md" />
      </div>

      <div className="order-detail-layout">
        <div className="order-detail-main">
          <div className="skeleton skeleton-block" />
          <div className="skeleton skeleton-block" />
        </div>

        <div className="skeleton order-detail-summary-skeleton" />
      </div>
    </div>
  </main>
);

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loadedOrderId, setLoadedOrderId] = useState(null);

  const loading = Boolean(id) && loadedOrderId !== id;

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    let active = true;

    const loadOrder = async () => {
      try {
        const response = await getOrder(id);

        if (!active) {
          return;
        }

        setOrder(extractOrder(response));
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("Sipariş detay hatası:", error?.response?.data ?? error);

        toast.error(
          error?.response?.data?.message ?? "Sipariş bilgileri yüklenemedi.",
        );

        setOrder(null);
      } finally {
        if (active) {
          setLoadedOrderId(id);
        }
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [id]);

  if (!id) {
    return (
      <main className="order-detail-page">
        <div className="container-custom">
          <div className="order-detail-empty">
            <IoReceiptOutline />

            <h1>Geçersiz sipariş adresi</h1>

            <p>Sipariş numarası bulunamadı.</p>

            <Link to="/orders">Siparişlerime Dön</Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <main className="order-detail-page">
        <div className="container-custom">
          <div className="order-detail-empty">
            <IoReceiptOutline />

            <h1>Sipariş bulunamadı</h1>

            <p>Aradığın sipariş silinmiş veya sana ait olmayabilir.</p>

            <Link to="/orders">Siparişlerime Dön</Link>
          </div>
        </div>
      </main>
    );
  }

  const items = Array.isArray(order?.items) ? order.items : [];

  const status = getStatus(order?.status);

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item?.quantity ?? 0),
    0,
  );

  const calculatedSubtotal = items.reduce((total, item) => {
    const price = Number(
      item?.price ?? item?.unit_price ?? item?.product?.price ?? 0,
    );

    const quantity = Number(item?.quantity ?? 0);

    return total + price * quantity;
  }, 0);

  const totalPrice = Number(
    order?.total_price ?? order?.total ?? calculatedSubtotal,
  );

  const timelineSteps = [
    {
      id: 1,
      title: "Sipariş Alındı",
      description: "Siparişin başarıyla oluşturuldu.",
      icon: IoReceiptOutline,
    },
    {
      id: 2,
      title: "Sipariş Onaylandı",
      description: "Siparişin satıcı tarafından onaylandı.",
      icon: IoCheckmarkCircleOutline,
    },
    {
      id: 3,
      title: "Hazırlanıyor",
      description: "Ürünlerin gönderim için hazırlanıyor.",
      icon: IoCubeOutline,
    },
    {
      id: 4,
      title: "Kargoda",
      description: "Siparişin teslimat için yola çıktı.",
      icon: IoTimeOutline,
    },
    {
      id: 5,
      title: "Teslim Edildi",
      description: "Siparişin teslim edildi.",
      icon: IoBagCheckOutline,
    },
  ];

  return (
    <main className="order-detail-page">
      <div className="container-custom">
        <button
          type="button"
          className="order-back-button"
          onClick={() => navigate(-1)}
        >
          <IoArrowBackOutline />
          Geri Dön
        </button>

        <div className="order-detail-header">
          <div>
            <span>Sipariş #{order.id}</span>

            <h1>Sipariş Detayı</h1>

            <p>{formatDate(order?.created_at)} tarihinde oluşturuldu.</p>
          </div>

          <span className={`order-status-badge ${status.className}`}>
            {status.label}
          </span>
        </div>

        <div className="order-detail-layout">
          <div className="order-detail-main">
            {status.className !== "cancelled" && (
              <section className="order-detail-section">
                <div className="order-section-header">
                  <div>
                    <IoTimeOutline />
                    <h2>Sipariş Durumu</h2>
                  </div>
                </div>

                <div className="order-timeline">
                  {timelineSteps.map((step) => {
                    const StepIcon = step.icon;
                    const active = step.id <= status.step;
                    const current = step.id === status.step;

                    return (
                      <div
                        key={step.id}
                        className={[
                          "order-timeline-step",
                          active ? "active" : "",
                          current ? "current" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <div className="order-timeline-icon">
                          <StepIcon />
                        </div>

                        <div>
                          <strong>{step.title}</strong>
                          <span>{step.description}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {status.className === "cancelled" && (
              <section className="order-cancelled-panel">
                <IoReceiptOutline />

                <div>
                  <h2>Sipariş iptal edildi</h2>

                  <p>
                    Bu sipariş iptal edildiği için işleme devam edilmeyecektir.
                  </p>
                </div>
              </section>
            )}

            <section className="order-detail-section">
              <div className="order-section-header">
                <div>
                  <IoCubeOutline />
                  <h2>Sipariş Ürünleri</h2>
                </div>

                <span>{totalQuantity} adet</span>
              </div>

              <div className="order-detail-products">
                {items.map((item, index) => {
                  const product = item?.product;
                  const imageUrl = getImageUrl(product);

                  const quantity = Number(item?.quantity ?? 0);

                  const price = Number(
                    item?.price ?? item?.unit_price ?? product?.price ?? 0,
                  );

                  const productPath = product?.slug
                    ? `/products/${product.slug}`
                    : product?.id
                      ? `/products/${product.id}`
                      : "/products";

                  return (
                    <article
                      key={item?.id ?? index}
                      className="order-detail-product"
                    >
                      <Link
                        to={productPath}
                        className="order-detail-product-image"
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt={product?.name ?? "Ürün"} />
                        ) : (
                          <IoCubeOutline />
                        )}
                      </Link>

                      <div className="order-detail-product-info">
                        {product?.category?.name && (
                          <span>{product.category.name}</span>
                        )}

                        <Link to={productPath}>{product?.name ?? "Ürün"}</Link>

                        {product?.seller?.name && (
                          <small>Satıcı: {product.seller.name}</small>
                        )}
                      </div>

                      <div className="order-detail-product-price">
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

            <section className="order-detail-section">
              <div className="order-section-header">
                <div>
                  <IoLocationOutline />
                  <h2>Teslimat Bilgileri</h2>
                </div>
              </div>

              <div className="order-address-card">
                <div>
                  <span>Teslim alacak kişi</span>

                  <strong>
                    {order?.shipping_name ??
                      order?.user?.name ??
                      "Belirtilmedi"}
                  </strong>
                </div>

                <div>
                  <span>Telefon</span>

                  <strong>
                    {order?.shipping_phone ?? order?.phone ?? "Belirtilmedi"}
                  </strong>
                </div>

                <div className="order-address-full">
                  <span>Adres</span>

                  <strong>
                    {order?.shipping_address ??
                      order?.address ??
                      "Teslimat adresi belirtilmedi."}
                  </strong>
                </div>
              </div>
            </section>
          </div>

          <aside className="order-detail-summary">
            <div className="order-summary-icon">
              <IoReceiptOutline />
            </div>

            <h2>Sipariş Özeti</h2>

            <div className="order-summary-row">
              <span>Sipariş numarası</span>
              <strong>#{order.id}</strong>
            </div>

            <div className="order-summary-row">
              <span>Ürün adedi</span>
              <strong>{totalQuantity}</strong>
            </div>

            <div className="order-summary-row">
              <span>Ara toplam</span>

              <strong>{formatPrice(calculatedSubtotal)}</strong>
            </div>

            <div className="order-summary-row">
              <span>Kargo</span>

              <strong className="order-free-shipping">Ücretsiz</strong>
            </div>

            <div className="order-summary-total">
              <span>Toplam</span>

              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <div className="order-summary-status">
              <IoStorefrontOutline />

              <div>
                <span>Sipariş durumu</span>
                <strong>{status.label}</strong>
              </div>
            </div>

            <Link to="/products" className="order-shopping-link">
              Alışverişe Devam Et
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default OrderDetail;
