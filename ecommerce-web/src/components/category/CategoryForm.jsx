import { useEffect, useMemo, useState } from "react";
import {
  IoCheckmarkCircleOutline,
  IoCloudUploadOutline,
  IoImageOutline,
  IoSaveOutline,
} from "react-icons/io5";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ?? "https://ecommerce-w7ko.onrender.com";

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? `${API_URL}/storage`;

const getImageUrl = (value) => {
  if (!value || typeof value !== "string") {
    return null;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value
      .replace("http://127.0.0.1:8000", API_URL)
      .replace("http://localhost:8000", API_URL);
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

const CategoryForm = ({
  initialValues = null,
  parentCategories = [],
  loading = false,
  errors = {},
  submitText = "Kaydet",
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: initialValues?.name ?? "",
    parent_id: initialValues?.parent_id ?? "",
    status:
      initialValues?.status === undefined
        ? true
        : Boolean(initialValues.status),
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState(
    getImageUrl(initialValues?.image),
  );

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const filteredParents = useMemo(
    () =>
      parentCategories.filter(
        (category) => Number(category.id) !== Number(initialValues?.id),
      ),
    [initialValues?.id, parentCategories],
  );

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    setFormData((current) => ({
      ...current,
      image: file,
    }));

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = new FormData();

    payload.append("name", formData.name.trim());
    payload.append("status", formData.status ? "1" : "0");

    if (formData.parent_id) {
      payload.append("parent_id", formData.parent_id);
    }

    if (formData.image) {
      payload.append("image", formData.image);
    }

    onSubmit?.(payload);
  };

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      <div className="category-form-layout">
        <div className="category-form-fields">
          <div className="category-form-group">
            <label htmlFor="name">
              Kategori adı <span>*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Örneğin: Elektronik"
              className={errors.name ? "is-invalid" : ""}
              disabled={loading}
            />

            {errors.name && (
              <small className="category-form-error">{errors.name}</small>
            )}
          </div>

          <div className="category-form-group">
            <label htmlFor="parent_id">Üst kategori</label>

            <select
              id="parent_id"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className={errors.parent_id ? "is-invalid" : ""}
              disabled={loading}
            >
              <option value="">Ana kategori olarak oluştur</option>

              {filteredParents.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {errors.parent_id && (
              <small className="category-form-error">{errors.parent_id}</small>
            )}
          </div>

          <label className="category-status-control">
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              disabled={loading}
            />

            <span className="category-status-switch" />

            <div>
              <strong>Kategori aktif</strong>
              <small>Aktif kategoriler müşterilere gösterilir.</small>
            </div>
          </label>
        </div>

        <div className="category-image-panel">
          <div className="category-image-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Kategori önizlemesi" />
            ) : (
              <div className="category-image-placeholder">
                <IoImageOutline />
                <span>Görsel seçilmedi</span>
              </div>
            )}
          </div>

          <label className="category-image-upload">
            <IoCloudUploadOutline />

            <div>
              <strong>Görsel seç</strong>
              <span>PNG, JPG veya WEBP</span>
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              disabled={loading}
            />
          </label>

          {errors.image && (
            <small className="category-form-error">{errors.image}</small>
          )}
        </div>
      </div>

      <div className="category-form-actions">
        <div className="category-form-info">
          <IoCheckmarkCircleOutline />
          <span>Kategori bilgilerini kontrol ederek kaydedin.</span>
        </div>

        <button
          type="submit"
          className="category-submit-button"
          disabled={loading}
        >
          {loading ? (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            />
          ) : (
            <IoSaveOutline />
          )}

          {loading ? "Kaydediliyor..." : submitText}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
