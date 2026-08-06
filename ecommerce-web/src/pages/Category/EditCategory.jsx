import { useEffect, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getCategories,
  getCategory,
  updateCategory,
} from "../../api/categoryApi";
import CategoryForm from "../../components/category/CategoryForm";

const extractCategory = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

const extractCategories = (response) => {
  const body = response?.data ?? response;

  return (
    [body?.data, body?.data?.data, body?.categories, body].find(
      Array.isArray,
    ) ?? []
  );
};

const normalizeErrors = (errors = {}) => {
  const normalized = {};

  Object.entries(errors).forEach(([field, messages]) => {
    normalized[field] = Array.isArray(messages) ? messages[0] : messages;
  });

  return normalized;
};

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);

  const [loadedId, setLoadedId] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const loading = loadedId !== id;

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    let active = true;

    const loadPage = async () => {
      try {
        const [categoryResponse, parentsResponse] = await Promise.all([
          getCategory(id),
          getCategories({
            per_page: 50,
            status: 1,
            sort: "name_asc",
          }),
        ]);

        if (!active) {
          return;
        }

        setCategory(extractCategory(categoryResponse));

        setParentCategories(extractCategories(parentsResponse));
      } catch (error) {
        if (!active) {
          return;
        }

        toast.error(
          error?.response?.data?.message ?? "Kategori bilgileri yüklenemedi.",
        );

        setCategory(null);
      } finally {
        if (active) {
          setLoadedId(id);
        }
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (formData) => {
    if (!category?.id || submitLoading) {
      return;
    }

    setSubmitLoading(true);
    setErrors({});

    try {
      const response = await updateCategory(category.id, formData);

      toast.success(
        response?.data?.message ?? "Kategori başarıyla güncellendi.",
      );

      navigate("/categories", {
        replace: true,
      });
    } catch (error) {
      setErrors(normalizeErrors(error?.response?.data?.errors));

      toast.error(error?.response?.data?.message ?? "Kategori güncellenemedi.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!id) {
    return (
      <main className="category-editor-page">
        <div className="container-custom">
          <div className="category-empty">
            <h1>Geçersiz kategori adresi</h1>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="category-editor-page">
        <div className="container-custom">
          <div className="category-editor-skeleton">
            <div className="skeleton skeleton-line skeleton-line-md" />
            <div className="skeleton skeleton-block" />
          </div>
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="category-editor-page">
        <div className="container-custom">
          <div className="category-empty">
            <h1>Kategori bulunamadı</h1>

            <Link to="/categories">Kategorilere dön</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="category-editor-page">
      <div className="container-custom">
        <Link to="/categories" className="category-editor-back">
          <IoArrowBackOutline />
          Kategorilere dön
        </Link>

        <div className="category-editor-header">
          <span>Kategori yönetimi</span>
          <h1>Kategori Düzenle</h1>
          <p>{category.name} kategorisinin bilgilerini güncelleyin.</p>
        </div>

        <CategoryForm
          key={category.id}
          initialValues={category}
          parentCategories={parentCategories}
          loading={submitLoading}
          errors={errors}
          submitText="Değişiklikleri Kaydet"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
};

export default EditCategory;
