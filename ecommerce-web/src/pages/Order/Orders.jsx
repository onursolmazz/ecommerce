import { useEffect, useState } from "react";
import {
  IoBagCheckOutline,
  IoChevronForwardOutline,
  IoCubeOutline,
  IoReceiptOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getOrders } from "../../api/orderApi";
import formatDate from "../../utils/formatDate";
import formatPrice from "../../utils/formatPrice";

const STATUS_CONFIG = {
  pending: {
    label: "Bekliyor",
    className: "pending",
  },
  confirmed: {
    label: "Onaylandı",
    className: "confirmed",
  },
  preparing: {
    label: "Hazırlanıyor",
    className: "preparing",
  },
  shipped: {
    label: "Kargoda",
    className: "shipped",
  },
  delivered: {
    label: "Teslim Edildi",
    className: "delivered",
  },
  cancelled: {
    label: "İptal Edildi",
    className: "cancelled",
  },
};

const API_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? `${API_URL}/storage`;

const extractOrders = (response) => {
  const body = response?.data ?? response;

  return (
    [body?.data, body?.data?.data, body?.orders, body?.result, body].find(
      Array.isArray,
    ) ?? []
  );
};

const extractMeta = (response) => {
  const body = response?.data ?? response;

  return body?.meta ?? body?.data?.meta ?? body?.pagination ?? {};
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

  const normalizedPath = image
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  return `${STORAGE_URL}/${normalizedPath}`;
};

const getStatus = (status) =>
  STATUS_CONFIG[status] ?? {
    label: status ?? "Bilinmiyor",
    className: "default",
  };

const OrdersSkeleton = () => (
  <div className="orders-list">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="order-card order-card-skeleton">
        <div className="order-card-header">
          <div className="order-skeleton-header">
            <div className="skeleton skeleton-line skeleton-line-sm" />
            <div className="skeleton skeleton-line skeleton-line-md" />
          </div>

          <div className="skeleton order-skeleton-status" />
        </div>

        <div className="order-card-content">
          <div className="order-skeleton-products">
            {Array.from({ length: 3 }).map((__, imageIndex) => (
              <div key={imageIndex} className="skeleton order-skeleton-image" />
            ))}
          </div>

          <div className="order-skeleton-summary">
            <div className="skeleton skeleton-line skeleton-line-sm" />
            <div className="skeleton skeleton-line skeleton-line-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      setLoading(true);

      try {
        const response = await getOrders();

        if (!active) {
          return;
        }

        setOrders(extractOrders(response));
        setMeta(extractMeta(response));
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "Sipariş listeleme hatası:",
          error?.response?.data ?? error,
        );

        toast.error(
          error?.response?.data?.message ?? "Siparişler yüklenemedi.",
        );

        setOrders([]);
        setMeta({});
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="orders-page">
        <div className="container-custom">
          <div className="orders-page-header">
            <div>
              <span>Sipariş geçmişi</span>
              <h1>Siparişlerim</h1>
              <p>Siparişlerin yükleniyor.</p>
            </div>
          </div>

          <OrdersSkeleton />
        </div>
      </main>
    );
  }

  if (!orders.length) {
    return (
      <main className="orders-page">
        <div className="container-custom">
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <IoReceiptOutline />
            </div>

            <h1>Henüz siparişin yok</h1>

            <p>
              İlk siparişini oluşturmak için ürünleri incelemeye
              başlayabilirsin.
            </p>

            <Link to="/products" className="orders-empty-button">
              <IoBagCheckOutline />
              Ürünleri Keşfet
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="container-custom">
        <div className="orders-page-header">
          <div>
            <span>Sipariş geçmişi</span>

            <h1>Siparişlerim</h1>

            <p>Toplam {meta?.total ?? orders.length} siparişin bulunuyor.</p>
          </div>
        </div>

        <div className="orders-list">
          {orders.map((order) => {
            const items = Array.isArray(order?.items) ? order.items : [];

            const status = getStatus(order?.status);

            const totalQuantity = items.reduce(
              (total, item) => total + Number(item?.quantity ?? 0),
              0,
            );

            return (
              <article key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-card-heading">
                    <div className="order-card-number">
                      <IoReceiptOutline />

                      <div>
                        <span>Sipariş numarası</span>
                        <strong>#{order.id}</strong>
                      </div>
                    </div>

                    <div className="order-card-date">
                      <IoTimeOutline />

                      <div>
                        <span>Sipariş tarihi</span>
                        <strong>{formatDate(order?.created_at)}</strong>
                      </div>
                    </div>
                  </div>

                  <span className={`order-status-badge ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="order-card-content">
                  <div className="order-card-products">
                    <div className="order-product-images">
                      {items.slice(0, 4).map((item, index) => {
                        const product = item?.product;
                        const imageUrl = getImageUrl(product);

                        return (
                          <div
                            key={item?.id ?? index}
                            className="order-product-image"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product?.name ?? "Ürün"}
                              />
                            ) : (
                              <IoCubeOutline />
                            )}
                          </div>
                        );
                      })}

                      {items.length > 4 && (
                        <div className="order-product-more">
                          +{items.length - 4}
                        </div>
                      )}
                    </div>

                    <div className="order-product-info">
                      <strong>
                        {items[0]?.product?.name ?? "Sipariş ürünleri"}
                      </strong>

                      <span>
                        {items.length > 1
                          ? `ve ${items.length - 1} farklı ürün`
                          : `${totalQuantity} adet ürün`}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-summary">
                    <div>
                      <span>Toplam</span>
                      <strong>
                        {formatPrice(order?.total_price ?? order?.total ?? 0)}
                      </strong>
                    </div>

                    <Link
                      to={`/orders/${order.id}`}
                      className="order-detail-link"
                    >
                      Sipariş Detayı
                      <IoChevronForwardOutline />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default Orders;
