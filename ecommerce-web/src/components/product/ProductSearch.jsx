import { IoCloseOutline, IoSearchOutline } from "react-icons/io5";

const ProductSearch = ({
  value = "",
  onChange,
  onSubmit,
  onClear,
  placeholder = "Ürün ara...",
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <form className="product-search" onSubmit={handleSubmit}>
      <IoSearchOutline className="product-search-icon" />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />

      {value && (
        <button
          type="button"
          className="product-search-clear"
          onClick={onClear}
          aria-label="Aramayı temizle"
        >
          <IoCloseOutline />
        </button>
      )}
    </form>
  );
};

export default ProductSearch;
