import { IoCloseOutline, IoFilterOutline } from "react-icons/io5";

const ProductFilter = ({
  categories = [],
  filters,
  onChange,
  onReset,
  mobileOpen = false,
  onMobileClose,
}) => {
  const update = (field, value) => {
    onChange?.({
      ...filters,
      [field]: value,
      page: 1,
    });
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="product-filter-backdrop"
          onClick={onMobileClose}
          aria-label="Filtre panelini kapat"
        />
      )}

      <aside
        className={["product-filter", mobileOpen ? "open" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="product-filter-header">
          <div>
            <IoFilterOutline />
            <h2>Filtreler</h2>
          </div>

          <button
            type="button"
            className="product-filter-close"
            onClick={onMobileClose}
            aria-label="Filtre panelini kapat"
          >
            <IoCloseOutline />
          </button>
        </div>

        <div className="product-filter-group">
          <label htmlFor="product-category">Kategori</label>

          <select
            id="product-category"
            value={filters.category_id ?? ""}
            onChange={(e) => update("category_id", e.target.value)}
          >
            <option value="">Tüm kategoriler</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="product-filter-group">
          <span className="product-filter-label">Fiyat Aralığı</span>

          <div className="product-filter-price-row">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.min_price ?? ""}
              onChange={(e) => update("min_price", e.target.value)}
            />

            <input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.max_price ?? ""}
              onChange={(e) => update("max_price", e.target.value)}
            />
          </div>
        </div>

        <div className="product-filter-group">
          <label htmlFor="product-sort">Sıralama</label>

          <select
            id="product-sort"
            value={filters.sort ?? "latest"}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="latest">En Yeniler</option>
            <option value="popular">En Popüler</option>
            <option value="price_asc">Fiyat Artan</option>
            <option value="price_desc">Fiyat Azalan</option>
            <option value="oldest">En Eskiler</option>
          </select>
        </div>

        <button
          type="button"
          className="product-filter-reset"
          onClick={onReset}
        >
          Filtreleri Temizle
        </button>
      </aside>
    </>
  );
};

export default ProductFilter;
