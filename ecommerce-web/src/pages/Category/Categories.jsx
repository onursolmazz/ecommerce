import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  IoAddOutline,
  IoAlbumsOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCreateOutline,
  IoImageOutline,
  IoSearchOutline,
  IoTrashOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { deleteCategory, getCategories } from "../../api/categoryApi";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ??
  "https://ecommerce-w7ko.onrender.com";
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? `${API_URL}/storage`;

const getImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/storage/")) {
    return `${API_URL}${value}`;
  }

  if (value.startsWith("/")) {
    return `${API_URL}${value}`;
  }

  const normalizedPath = value
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  return `${STORAGE_URL}/${normalizedPath}`;
};

const extractCategories = (response) => {
  const body = response?.data ?? response;

  return (
    [body?.data, body?.data?.data, body?.categories, body].find(
      Array.isArray,
    ) ?? []
  );
};

const extractMeta = (response) => response?.data?.meta ?? response?.meta ?? {};

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ?? error?.message ?? fallbackMessage;

const CategorySkeleton = () => (
  <div className="category-management-grid">
    {Array.from({ length: 8 }).map((_, index) => (
      <div
        key={index}
        className="category-management-card category-management-skeleton"
      >
        <div className="skeleton category-management-skeleton-image" />

        <div className="category-management-skeleton-body">
          <div className="skeleton skeleton-line skeleton-line-sm" />
          <div className="skeleton skeleton-line skeleton-line-md" />
        </div>
      </div>
    ))}
  </div>
);

const Categories = () => {
  const user = useSelector((state) => state.auth?.user);

  const role = String(
    user?.role?.slug ?? user?.role?.name ?? user?.role ?? "",
  ).toLowerCase();

  const canManage = role === "admin" || role === "seller";

  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({});
  const [loadedKey, setLoadedKey] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sort: "latest",
    page: 1,
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const requestKey = JSON.stringify(filters);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const params = {
          page: filters.page,
          per_page: 12,
          sort: filters.sort,
        };

        if (filters.search.trim()) {
          params.search = filters.search.trim();
        }

        if (filters.status !== "") {
          params.status = filters.status;
        }

        const response = await getCategories(params);

        if (!active) {
          return;
        }

        setCategories(extractCategories(response));
        setMeta(extractMeta(response));
      } catch (error) {
        if (!active) {
          return;
        }

        toast.error(getErrorMessage(error, "Kategoriler yüklenemedi."));

        setCategories([]);
        setMeta({});
      } finally {
        if (active) {
          setLoadedKey(requestKey);
        }
      }
    };

    const timeout = window.setTimeout(loadCategories, filters.search ? 350 : 0);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [filters, requestKey]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      page: name === "page" ? value : 1,
    }));
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) {
      return;
    }

    setDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  const handleDelete = async () => {
    if (!selectedCategory?.id || deleteLoading) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await deleteCategory(selectedCategory.id);

      setCategories((current) =>
        current.filter(
          (category) => Number(category.id) !== Number(selectedCategory.id),
        ),
      );

      toast.success(response?.data?.message ?? "Kategori başarıyla silindi.");

      closeDeleteModal();
    } catch (error) {
      toast.error(getErrorMessage(error, "Kategori silinemedi."));
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    }
  };

  return (
    <>
      <main className="category-management-page">
        <div className="container-custom">
          <div className="category-management-header">
            <div>
              <span>Kategori yönetimi</span>
              <h1>Kategoriler</h1>
              <p>Ürün kategorilerini görüntüleyin ve düzenleyin.</p>
            </div>

            {canManage && (
              <Link to="/categories/create" className="category-create-button">
                <IoAddOutline />
                Yeni Kategori
              </Link>
            )}
          </div>

          <div className="category-filter-panel">
            <div className="category-search-field">
              <IoSearchOutline />

              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Kategori ara..."
              />
            </div>

            <select
              value={filters.status}
              onChange={(event) => updateFilter("status", event.target.value)}
            >
              <option value="">Tüm durumlar</option>
              <option value="1">Aktif</option>
              <option value="0">Pasif</option>
            </select>

            <select
              value={filters.sort}
              onChange={(event) => updateFilter("sort", event.target.value)}
            >
              <option value="latest">En yeni</option>
              <option value="oldest">En eski</option>
              <option value="name_asc">Ada göre A-Z</option>
              <option value="name_desc">Ada göre Z-A</option>
              <option value="popular">En çok ürün</option>
            </select>
          </div>

          {loading ? (
            <CategorySkeleton />
          ) : categories.length ? (
            <>
              <div className="category-management-grid">
                {categories.map((category) => {
                  const imageUrl = getImageUrl(category?.image);

                  return (
                    <article
                      key={category.id}
                      className="category-management-card"
                    >
                      <div className="category-management-image">
                        {imageUrl ? (
                          <img src={imageUrl} alt={category.name} />
                        ) : (
                          <IoImageOutline />
                        )}

                        <span
                          className={[
                            "category-status-badge",
                            category.status ? "active" : "passive",
                          ].join(" ")}
                        >
                          {category.status ? "Aktif" : "Pasif"}
                        </span>
                      </div>

                      <div className="category-management-body">
                        <span>{category?.parent?.name ?? "Ana kategori"}</span>

                        <h2>{category.name}</h2>

                        <small>Slug: {category.slug}</small>

                        {Array.isArray(category.children) &&
                          category.children.length > 0 && (
                            <div className="category-children-count">
                              <IoAlbumsOutline />
                              {category.children.length} alt kategori
                            </div>
                          )}

                        {canManage && (
                          <div className="category-management-actions">
                            <Link
                              to={`/categories/${category.id}/edit`}
                              className="category-edit-button"
                            >
                              <IoCreateOutline />
                              Düzenle
                            </Link>

                            <button
                              type="button"
                              className="category-delete-button"
                              onClick={() => openDeleteModal(category)}
                            >
                              <IoTrashOutline />
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {Number(meta?.last_page ?? 1) > 1 && (
                <div className="category-pagination">
                  <button
                    type="button"
                    onClick={() =>
                      updateFilter(
                        "page",
                        Math.max(1, Number(filters.page) - 1),
                      )
                    }
                    disabled={Number(filters.page) <= 1}
                  >
                    <IoChevronBackOutline />
                  </button>

                  <span>
                    {meta.current_page ?? filters.page} / {meta.last_page ?? 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateFilter(
                        "page",
                        Math.min(
                          Number(meta.last_page ?? 1),
                          Number(filters.page) + 1,
                        ),
                      )
                    }
                    disabled={
                      Number(filters.page) >= Number(meta.last_page ?? 1)
                    }
                  >
                    <IoChevronForwardOutline />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="category-empty">
              <IoAlbumsOutline />
              <h2>Kategori bulunamadı</h2>
              <p>Arama kriterlerinize uygun kategori yok.</p>
            </div>
          )}
        </div>
      </main>

      {deleteModalOpen && (
        <div className="category-modal-backdrop">
          <div
            className="category-delete-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="category-delete-modal-icon">
              <IoWarningOutline />
            </div>

            <h2>Kategoriyi sil</h2>

            <p>
              <strong>{selectedCategory?.name}</strong> kategorisini silmek
              istediğinize emin misiniz?
            </p>

            <small>
              Alt kategorisi veya ürünü bulunan kategoriler silinemez.
            </small>

            <div className="category-delete-modal-actions">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Siliniyor..." : "Kategoriyi Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
