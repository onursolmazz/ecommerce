import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  IoArrowForward,

  IoStarOutline,
} from "react-icons/io5";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getProducts } from "../../api/productApi";
import { getCategories } from "../../api/categoryApi";
import ProductCard from "../../components/product/ProductCard";
import Empty from "../../components/common/Empty";

const API_URL = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:8000";

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? `${API_URL}/storage`;

const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85";

const extractItems = (response) => {
  const body = response?.data ?? response;

  const candidates = [
    body?.data,
    body?.data?.data,
    body?.products,
    body?.categories,
    body?.result,
    body,
  ];

  return candidates.find(Array.isArray) ?? [];
};

const getStorageUrl = (value) => {
  if (!value) {
    return null;
  }

  const path =
    typeof value === "string"
      ? value
      : (value?.url ?? value?.image_url ?? value?.path ?? value?.image ?? null);

  if (!path || typeof path !== "string") {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${API_URL}${path}`;
  }

  if (path.startsWith("/")) {
    return path;
  }

  const normalizedPath = path
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  return `${STORAGE_URL}/${normalizedPath}`;
};

const getProductImage = (product) => {
  const images = Array.isArray(product?.images) ? product.images : [];

  const primaryImage = images.find(
    (image) =>
      image?.is_primary === true ||
      image?.is_primary === 1 ||
      image?.is_primary === "1",
  );

  return getStorageUrl(
    product?.primary_image ??
      primaryImage ??
      images[0] ??
      product?.image_url ??
      product?.image,
  );
};

const getCategoryImage = (category) =>
  getStorageUrl(category?.image_url ?? category?.image);

const getProductPopularity = (product) => {
  const salesCount = Number(
    product?.sales_count ?? product?.sold_count ?? product?.total_sales ?? 0,
  );

  const orderCount = Number(
    product?.orders_count ?? product?.order_items_count ?? 0,
  );

  const reviewCount = Number(
    product?.reviews_count ?? product?.review_count ?? 0,
  );

  const favoriteCount = Number(
    product?.favorites_count ?? product?.favorite_count ?? 0,
  );

  const rating = Number(
    product?.average_rating ??
      product?.reviews_avg_rating ??
      product?.rating ??
      0,
  );

  return (
    salesCount * 10 +
    orderCount * 8 +
    reviewCount * 3 +
    favoriteCount * 2 +
    rating
  );
};

const getProductDate = (product) => {
  const value =
    product?.created_at ?? product?.published_at ?? product?.updated_at;

  const timestamp = value
    ? new Date(value).getTime()
    : Number(product?.id ?? 0);

  return Number.isNaN(timestamp) ? Number(product?.id ?? 0) : timestamp;
};

const ProductCardSkeleton = () => (
  <div className="product-card-skeleton" aria-hidden="true">
    <div className="skeleton skeleton-product-image" />
    <div className="skeleton-product-body">
      <div className="skeleton skeleton-line skeleton-line-category" />
      <div className="skeleton skeleton-line skeleton-line-title" />
      <div className="skeleton skeleton-line skeleton-line-title-short" />
      <div className="skeleton skeleton-line skeleton-line-rating" />
      <div className="skeleton-product-footer">
        <div className="skeleton skeleton-line skeleton-line-price" />
        <div className="skeleton skeleton-circle skeleton-cart" />
      </div>
    </div>
  </div>
);

const CategoryCardSkeleton = () => (
  <div className="category-card-skeleton" aria-hidden="true">
    <div className="skeleton skeleton-category-image" />
    <div className="skeleton-category-content">
      <div className="skeleton skeleton-line skeleton-category-title" />
      <div className="skeleton skeleton-line skeleton-category-link" />
    </div>
  </div>
);

const HeroSkeleton = () => (
  <div className="hero-skeleton" aria-hidden="true">
    <div className="hero-skeleton-content">
      <div className="skeleton skeleton-line skeleton-hero-eyebrow" />
      <div className="skeleton skeleton-line skeleton-hero-title" />
      <div className="skeleton skeleton-line skeleton-hero-title-short" />
      <div className="skeleton skeleton-line skeleton-hero-text" />
      <div className="skeleton skeleton-line skeleton-hero-text-short" />
      <div className="skeleton skeleton-hero-button" />
    </div>
  </div>
);

const ProductSliderSkeleton = ({ count = 6 }) => (
  <div className="product-skeleton-row">
    {Array.from({ length: count }, (_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

const ProductGridSkeleton = ({ count = 12 }) => (
  <div className="home-product-grid">
    {Array.from({ length: count }, (_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

const CategorySliderSkeleton = ({ count = 6 }) => (
  <div className="category-skeleton-row">
    {Array.from({ length: count }, (_, index) => (
      <CategoryCardSkeleton key={index} />
    ))}
  </div>
);

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const response = await getCategories({
          per_page: 50,
          status: 1,
        });

        if (!active) {
          return;
        }

        setCategories(extractItems(response));
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("Kategori API hatası:", error?.response?.data ?? error);

        toast.error("Kategoriler yüklenemedi.");
        setCategories([]);
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    };

    const loadProducts = async () => {
      try {
        const response = await getProducts({
          per_page: 50,
          status: 1,
        });

        if (!active) {
          return;
        }

        setProducts(extractItems(response));
      } catch (error) {
        if (!active) {
          return;
        }

        console.error("Ürün API hatası:", error?.response?.data ?? error);

        toast.error("Ürünler yüklenemedi.");
        setProducts([]);
      } finally {
        if (active) {
          setProductsLoading(false);
        }
      }
    };

    loadCategories();
    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const activeCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category?.status === undefined ||
          category?.status === true ||
          category?.status === 1 ||
          category?.status === "1",
      ),
    [categories],
  );

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          product?.status === undefined ||
          product?.status === true ||
          product?.status === 1 ||
          product?.status === "1",
      ),
    [products],
  );

  const popularProducts = useMemo(
    () =>
      [...activeProducts]
        .sort(
          (firstProduct, secondProduct) =>
            getProductPopularity(secondProduct) -
            getProductPopularity(firstProduct),
        )
        .slice(0, 10),
    [activeProducts],
  );

  const latestProducts = useMemo(
    () =>
      [...activeProducts].sort((firstProduct, secondProduct) => {
        const dateDifference =
          getProductDate(secondProduct) - getProductDate(firstProduct);

        if (dateDifference !== 0) {
          return dateDifference;
        }

        return Number(secondProduct?.id ?? 0) - Number(firstProduct?.id ?? 0);
      }),
    [activeProducts],
  );

  const heroProducts = useMemo(() => {
    const source =
      popularProducts.length > 0 ? popularProducts : latestProducts;

    return source.slice(0, 4);
  }, [popularProducts, latestProducts]);

  const handleAddToCart = (product) => {
    toast.info(
      `${product?.name ?? "Ürün"} için sepet bağlantısı hazırlanıyor.`,
    );
  };

  const handleToggleFavorite = (product) => {
    toast.info(
      `${product?.name ?? "Ürün"} için favori bağlantısı hazırlanıyor.`,
    );
  };

  return (
    <div className="home-page">
      <section className="home-hero-section">
        <div className="container-custom">
          {productsLoading ? (
            <HeroSkeleton />
          ) : heroProducts.length > 0 ? (
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              slidesPerView={1}
              speed={850}
              loop={heroProducts.length > 1}
              navigation={heroProducts.length > 1}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={
                heroProducts.length > 1
                  ? {
                      delay: 4500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              className="hero-swiper"
            >
              {heroProducts.map((product) => {
                const heroImage =
                  getProductImage(product) ?? FALLBACK_HERO_IMAGE;

                return (
                  <SwiperSlide key={product.id}>
                    <article
                      className="hero-slide"
                      style={{
                        backgroundImage: `linear-gradient(
                          90deg,
                          rgba(10, 10, 10, 0.82) 0%,
                          rgba(10, 10, 10, 0.54) 48%,
                          rgba(10, 10, 10, 0.08) 100%
                        ), url("${heroImage}")`,
                      }}
                    >
                      <div className="hero-slide-content">
                        <span className="hero-slide-eyebrow">
                          {product?.category?.name ?? "Popüler ürün"}
                        </span>

                        <h1>{product?.name}</h1>

                        <p>
                          {product?.short_description ??
                            product?.description ??
                            "En çok tercih edilen ürünlerimizi keşfet ve alışverişe hemen başla."}
                        </p>

                        <Link
                          to={`/products/${product?.slug ?? product?.id}`}
                          className="btn btn-primary hero-slide-button"
                        >
                          Ürünü İncele
                          <IoArrowForward />
                        </Link>
                      </div>
                    </article>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <div className="hero-empty">
              <div>
                <span>Yeni koleksiyon</span>
                <h1>Yeni ürünleri keşfet</h1>
                <p>Mağazamıza yeni eklenen ürünleri hemen inceleyebilirsin.</p>

                <Link to="/products" className="btn btn-primary">
                  Ürünleri Gör
                  <IoArrowForward />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="home-section category-section">
        <div className="container-custom">
          <div className="home-section-header">
            <div>
              <span className="home-section-eyebrow">Kategoriler</span>
              <h2>Popüler kategorileri keşfet</h2>
              <p>İhtiyacın olan ürünlere hızlıca ulaş.</p>
            </div>

            <Link to="/categories" className="home-section-link">
              Tüm Kategoriler
              <IoArrowForward />
            </Link>
          </div>

          {categoriesLoading ? (
            <CategorySliderSkeleton />
          ) : activeCategories.length > 0 ? (
            <Swiper
              modules={[Autoplay, Navigation]}
              speed={700}
              loop={activeCategories.length > 6}
              navigation={activeCategories.length > 1}
              grabCursor
              watchOverflow
              spaceBetween={16}
              slidesPerView={1.35}
              autoplay={
                activeCategories.length > 1
                  ? {
                      delay: 2600,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              breakpoints={{
                420: {
                  slidesPerView: 1.7,
                },
                576: {
                  slidesPerView: 2.4,
                },
                768: {
                  slidesPerView: 3.3,
                },
                992: {
                  slidesPerView: 4.3,
                },
                1200: {
                  slidesPerView: 5.3,
                },
                1400: {
                  slidesPerView: 6.1,
                },
              }}
              className="category-swiper"
            >
              {activeCategories.map((category) => {
                const categoryImage = getCategoryImage(category);

                return (
                  <SwiperSlide key={category.id}>
                    <Link
                      to={`/products?category=${
                        category?.slug ?? category?.id
                      }`}
                      className="category-card"
                    >
                      {categoryImage ? (
                        <img
                          src={categoryImage}
                          alt={category?.name ?? "Kategori"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="category-image-placeholder">
                          {category?.name}
                        </div>
                      )}

                      <div className="category-card-overlay">
                        <h3>{category?.name}</h3>
                        <span>
                          Ürünleri Gör
                          <IoArrowForward />
                        </span>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            <Empty
              title="Kategori bulunamadı"
              description="API cevabında görüntülenecek aktif kategori bulunmuyor."
            />
          )}
        </div>
      </section>

      <section className="home-section popular-products-section">
        <div className="container-custom">
          <div className="home-section-header">
            <div>
              <span className="home-section-eyebrow">
                <IoStarOutline />
                Çok tercih edilenler
              </span>
              <h2>En popüler ürünler</h2>
              <p>Kullanıcıların en çok ilgi gösterdiği ürünleri keşfet.</p>
            </div>

            <Link to="/products?sort=popular" className="home-section-link">
              Tümünü Gör
              <IoArrowForward />
            </Link>
          </div>

          {productsLoading ? (
            <ProductSliderSkeleton />
          ) : popularProducts.length > 0 ? (
            <Swiper
              modules={[Autoplay, Navigation]}
              speed={650}
              navigation={popularProducts.length > 1}
              grabCursor
              watchOverflow
              spaceBetween={16}
              slidesPerView={1.45}
              autoplay={
                popularProducts.length > 1
                  ? {
                      delay: 3200,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              breakpoints={{
                420: {
                  slidesPerView: 1.8,
                },
                576: {
                  slidesPerView: 2.4,
                },
                768: {
                  slidesPerView: 3.2,
                },
                992: {
                  slidesPerView: 4.2,
                },
                1200: {
                  slidesPerView: 5.2,
                },
                1400: {
                  slidesPerView: 6,
                },
              }}
              className="product-swiper"
            >
              {popularProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <Empty
              title="Popüler ürün bulunamadı"
              description="API cevabında görüntülenecek aktif ürün bulunmuyor."
            />
          )}
        </div>
      </section>

      <section className="home-section latest-products-section">
        <div className="container-custom">
          <div className="home-section-header">
            <div>
              <span className="home-section-eyebrow">Yeni eklenenler</span>
              <h2>En yeni ürünler</h2>
              <p>Mağazamıza yeni eklenen ürünleri incele.</p>
            </div>

            <Link to="/products?sort=latest" className="home-section-link">
              Tümünü Gör
              <IoArrowForward />
            </Link>
          </div>

          {productsLoading ? (
            <ProductGridSkeleton />
          ) : latestProducts.length > 0 ? (
            <div className="home-product-grid">
              {latestProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <Empty
              title="Yeni ürün bulunamadı"
              description="API cevabında görüntülenecek aktif ürün bulunmuyor."
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
