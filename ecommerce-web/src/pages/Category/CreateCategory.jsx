import { useEffect, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createCategory, getCategories } from "../../api/categoryApi";
import CategoryForm from "../../components/category/CategoryForm";

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

const CreateCategory = () => {
  const navigate = useNavigate();

  const [parentCategories, setParentCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let active = true;

    const loadParents = async () => {
      try {
        const response = await getCategories({
          per_page: 50,
          status: 1,
          root_only: 1,
          sort: "name_asc",
        });

        if (active) {
          setParentCategories(extractCategories(response));
        }
      } catch (error) {
        console.error("Üst kategoriler yüklenemedi:", error);
      }
    };

    loadParents();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (formData) => {
    if (loading) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await createCategory(formData);

      toast.success(
        response?.data?.message ?? "Kategori başarıyla oluşturuldu.",
      );

      navigate("/categories", {
        replace: true,
      });
    } catch (error) {
      setErrors(normalizeErrors(error?.response?.data?.errors));

      toast.error(error?.response?.data?.message ?? "Kategori oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="category-editor-page">
      <div className="container-custom">
        <Link to="/categories" className="category-editor-back">
          <IoArrowBackOutline />
          Kategorilere dön
        </Link>

        <div className="category-editor-header">
          <span>Kategori yönetimi</span>
          <h1>Yeni Kategori</h1>
          <p>
            Ürünlerin düzenli listelenmesi için yeni bir kategori oluşturun.
          </p>
        </div>

        <CategoryForm
          parentCategories={parentCategories}
          loading={loading}
          errors={errors}
          submitText="Kategori Oluştur"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
};

export default CreateCategory;
