import ProductGallery from "./ProductGallery";

const ProductImages = ({ product }) => {
  return (
    <div className="product-images">
      <ProductGallery
        images={product?.images}
        primaryImage={product?.primary_image}
        productName={product?.name}
      />
    </div>
  );
};

export default ProductImages;
