import formatPrice from "../../utils/formatPrice";

const ProductPrice = ({ product }) => {
  const price = Number(product?.price || 0);
  const oldPrice = Number(product?.old_price || 0);

  const hasDiscount = oldPrice > price;

  const discount = hasDiscount
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  return (
    <div className="product-price">
      {hasDiscount && (
        <div className="product-old-price">{formatPrice(oldPrice)}</div>
      )}

      <div className="product-current-price">{formatPrice(price)}</div>

      {hasDiscount && (
        <span className="product-discount">%{discount} İndirim</span>
      )}
    </div>
  );
};

export default ProductPrice;
