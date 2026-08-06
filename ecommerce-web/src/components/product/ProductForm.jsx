import { useState } from "react";
import { IoAdd, IoRemove, IoCartOutline } from "react-icons/io5";

import Button from "../common/Button";

const ProductForm = ({ product, loading = false, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);

  const stock = Number(product?.stock || 0);

  const increase = () => {
    if (quantity < stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrease = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit?.({
      product_id: product.id,
      quantity,
    });
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-stock">
        {stock > 0 ? (
          <span className="in-stock">✓ Stokta {stock} adet var</span>
        ) : (
          <span className="out-stock">Stokta yok</span>
        )}
      </div>

      <div className="product-quantity">
        <button type="button" onClick={decrease} disabled={quantity <= 1}>
          <IoRemove />
        </button>

        <span>{quantity}</span>

        <button type="button" onClick={increase} disabled={quantity >= stock}>
          <IoAdd />
        </button>
      </div>

      <Button
        type="submit"
        fullWidth
        loading={loading}
        disabled={stock <= 0}
        icon={<IoCartOutline />}
      >
        Sepete Ekle
      </Button>
    </form>
  );
};

export default ProductForm;
