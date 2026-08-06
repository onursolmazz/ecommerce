import { useCallback, useEffect, useMemo, useState } from "react";
import { IoFilterOutline, IoGridOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import Pagination from "../../components/common/Pagination";
import ProductFilter from "../../components/product/ProductFilter";
import ProductGrid from "../../components/product/ProductGrid";
import ProductSearch from "../../components/product/ProductSearch";

const extractItems = (response) => {
  const body = response?.data ?? response;

  return (
    [body?.data, body?.data?.data, body?.products, body?.result, body].find(
      Array.isArray,
    ) ?? []
  );
};

const extractMeta = (response) => {
  const body = response?.data ?? response;

  return body?.meta ?? body?.data?.meta ?? body?.pagination ?? {};
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      category_id: searchParams.get("category_id") ?? "",
      min_price: searchParams.get("min_price") ?? "",
      max_price: searchParams.get("max_price") ?? "",
      sort: searchParams.get("sort") ?? "latest",
      page: Number(searchParams.get("page") ?? 1),
      per_page: Number(searchParams.get("per_page") ?? 12),
      status: 1,
    }),
    [searchParams],
  );

  const updateFilters = useCallback(
    (nextFilters) => {
      const nextParams = new URLSearchParams();

      Object.entries(nextFilters).forEach(([key, value]) => {
        if (
          value !== "" &&
          value !== null &&
          value !== undefined &&
          key !== "status"
        ) {
          nextParams.set(key, String(value));
        }
      });

      setSearchParams(nextParams);
    },
    [setSearchParams],
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories({
          per_page: 100,
          status: 1,
        });

        setCategories(extractItems(response));
      } catch (error) {
        console.error(error);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const response = await getProducts(filters);

        if (!active) {
          return;
        }

        setProducts(extractItems(response));
        setMeta(extractMeta(response));
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("Ürün listeleme hatası:", error?.response?.data ?? error);

        toast.error(error?.response?.data?.message ?? "Ürünler yüklenemedi.");

        setProducts([]);
        setMeta({});
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      active = false;
    };
  }, [filters]);

  const handleReset = () => {
    updateFilters({
      search: "",
      category_id: "",
      min_price: "",
      max_price: "",
      sort: "latest",
      page: 1,
      per_page: 12,
    });
  };

  const handlePageChange = (page) => {
    updateFilters({
      ...filters,
      page,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAddToCart = (product) => {
    toast.info(`${product?.name ?? "Ürün"} sepete eklenecek.`);
  };

  const handleToggleFavorite = (product) => {
    toast.info(`${product?.name ?? "Ürün"} favorilere eklenecek.`);
  };

  return (
    <main className="products-page">
      <div className="container-custom">
        <div className="products-page-header">
          <div>
            <span className="products-page-eyebrow">
              <IoGridOutline />
              Ürünler
            </span>

            <h1>Tüm ürünleri keşfet</h1>

            <p>
              Arama, kategori, fiyat ve sıralama seçenekleriyle aradığın ürünü
              kolayca bul.
            </p>
          </div>

          <button
            type="button"
            className="products-mobile-filter-button"
            onClick={() => setMobileFilterOpen(true)}
          >
            <IoFilterOutline />
            Filtreler
          </button>
        </div>

        <div className="products-toolbar">
          <ProductSearch
            value={filters.search}
            onChange={(value) =>
              updateFilters({
                ...filters,
                search: value,
                page: 1,
              })
            }
            onClear={() =>
              updateFilters({
                ...filters,
                search: "",
                page: 1,
              })
            }
          />

          <span className="products-result-count">
            {meta?.total ?? products.length} ürün
          </span>
        </div>

        <div className="products-layout">
          <ProductFilter
            categories={categories}
            filters={filters}
            onChange={updateFilters}
            onReset={handleReset}
            mobileOpen={mobileFilterOpen}
            onMobileClose={() => setMobileFilterOpen(false)}
          />

          <div className="products-content">
            <ProductGrid
              products={products}
              loading={loading}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
            />

            {!loading && Number(meta?.last_page ?? 1) > 1 && (
              <Pagination
                currentPage={Number(meta?.current_page ?? filters.page)}
                lastPage={Number(meta?.last_page ?? 1)}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Products;
