import {
  IoBagCheckOutline,
  IoCheckmarkCircleOutline,
  IoChevronForwardOutline,
  IoReceiptOutline,
  IoStorefrontOutline,
} from "react-icons/io5";
import { Link, useLocation, useParams } from "react-router-dom";
import formatPrice from "../../utils/formatPrice";

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();

  const order = location.state?.order ?? null;

  const orderId = order?.id ?? id;

  const totalPrice = Number(order?.total_price ?? order?.total ?? 0);

  return (
    <main className="order-success-page">
      <div className="container-custom">
        <section className="order-success-card">
          <div className="order-success-visual">
            <div className="order-success-icon">
              <IoCheckmarkCircleOutline />
            </div>

            <span className="order-success-badge">Sipariş alındı</span>
          </div>

          <div className="order-success-content">
            <h1>Siparişiniz başarıyla oluşturuldu</h1>

            <p>
              Siparişiniz alınmıştır. Sipariş durumunu siparişlerim sayfasından
              takip edebilirsiniz.
            </p>
          </div>

          <div className="order-success-info">
            <div className="order-success-info-item">
              <IoReceiptOutline />

              <div>
                <span>Sipariş numarası</span>
                <strong>#{orderId}</strong>
              </div>
            </div>

            {totalPrice > 0 && (
              <div className="order-success-info-item">
                <IoBagCheckOutline />

                <div>
                  <span>Toplam tutar</span>
                  <strong>{formatPrice(totalPrice)}</strong>
                </div>
              </div>
            )}

            <div className="order-success-info-item">
              <IoStorefrontOutline />

              <div>
                <span>Sipariş durumu</span>
                <strong>Hazırlanıyor</strong>
              </div>
            </div>
          </div>

          <div className="order-success-notice">
            <IoCheckmarkCircleOutline />

            <p>
              Siparişinizle ilgili güncellemeler bildirimler bölümünden
              paylaşılacaktır.
            </p>
          </div>

          <div className="order-success-actions">
            <Link
              to={`/orders/${orderId}`}
              className="order-success-primary-button"
            >
              Sipariş Detayına Git
              <IoChevronForwardOutline />
            </Link>

            <Link to="/orders" className="order-success-secondary-button">
              Siparişlerim
            </Link>

            <Link to="/products" className="order-success-shopping-link">
              Alışverişe devam et
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default OrderSuccess;
