import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";

const ProductRating = ({ rating = 0, reviewCount = 0 }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<IoStar key={i} />);
    } else if (rating >= i - 0.5) {
      stars.push(<IoStarHalf key={i} />);
    } else {
      stars.push(<IoStarOutline key={i} />);
    }
  }

  return (
    <div className="product-rating">
      <div className="product-rating-stars">{stars}</div>

      <span className="product-rating-value">{Number(rating).toFixed(1)}</span>

      <span className="product-rating-count">
        ({reviewCount} değerlendirme)
      </span>
    </div>
  );
};

export default ProductRating;
