import { useMemo, useState } from "react";
import { IoImageOutline } from "react-icons/io5";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ?? "https://ecommerce-w7ko.onrender.com";

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL ?? `${API_URL}/storage`;

const getImageUrl = (value) => {
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

  if (path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
      .replace("http://127.0.0.1:8000", API_URL)
      .replace("http://localhost:8000", API_URL);
  }

  if (path.startsWith("/storage/")) {
    return `${API_URL}${path}`;
  }

  if (path.startsWith("/")) {
    return `${API_URL}${path}`;
  }

  const normalizedPath = path
    .replace(/^public\//, "")
    .replace(/^storage\//, "");

  return `${STORAGE_URL}/${normalizedPath}`;
};

const ProductGallery = ({
  images = [],
  primaryImage = null,
  productName = "Ürün",
}) => {
  const [selectedImageId, setSelectedImageId] = useState(null);

  const [failedImageUrls, setFailedImageUrls] = useState([]);

  const normalizedImages = useMemo(() => {
    const imageList = Array.isArray(images) ? images : [];

    const mappedImages = imageList
      .map((image, index) => ({
        id: image?.id ?? `image-${index}`,
        url: getImageUrl(image),
        isPrimary:
          image?.is_primary === true ||
          image?.is_primary === 1 ||
          image?.is_primary === "1",
      }))
      .filter((image) => Boolean(image.url));

    const primaryUrl = getImageUrl(primaryImage);

    if (primaryUrl && !mappedImages.some((image) => image.url === primaryUrl)) {
      mappedImages.unshift({
        id: primaryImage?.id ?? "primary-image",
        url: primaryUrl,
        isPrimary: true,
      });
    }

    return mappedImages;
  }, [images, primaryImage]);

  const defaultImage = useMemo(
    () =>
      normalizedImages.find((image) => image.isPrimary) ??
      normalizedImages[0] ??
      null,
    [normalizedImages],
  );

  const activeImage = useMemo(() => {
    const selectedImage = normalizedImages.find(
      (image) => image.id === selectedImageId,
    );

    return selectedImage ?? defaultImage;
  }, [normalizedImages, selectedImageId, defaultImage]);

  const activeImageFailed =
    !activeImage?.url || failedImageUrls.includes(activeImage.url);

  const handleImageSelect = (image) => {
    setSelectedImageId(image.id);
  };

  const handleImageError = (url) => {
    if (!url) {
      return;
    }

    setFailedImageUrls((currentUrls) =>
      currentUrls.includes(url) ? currentUrls : [...currentUrls, url],
    );
  };

  if (!normalizedImages.length) {
    return (
      <div className="product-gallery-empty">
        <IoImageOutline />
        <span>Görsel bulunamadı</span>
      </div>
    );
  }

  return (
    <div className="product-gallery">
      <div className="product-gallery-thumbnails">
        {normalizedImages.map((image, index) => {
          const thumbnailFailed = failedImageUrls.includes(image.url);

          return (
            <button
              key={image.id}
              type="button"
              className={activeImage?.id === image.id ? "active" : ""}
              onClick={() => handleImageSelect(image)}
              aria-label={`${productName} görseli ${index + 1}`}
              aria-pressed={activeImage?.id === image.id}
            >
              {!thumbnailFailed ? (
                <img
                  src={image.url}
                  alt={`${productName} küçük görsel ${index + 1}`}
                  loading="lazy"
                  onError={() => handleImageError(image.url)}
                />
              ) : (
                <IoImageOutline />
              )}
            </button>
          );
        })}
      </div>

      <div className="product-gallery-main">
        {!activeImageFailed ? (
          <img
            key={activeImage.url}
            src={activeImage.url}
            alt={productName}
            onError={() => handleImageError(activeImage.url)}
          />
        ) : (
          <div className="product-gallery-empty">
            <IoImageOutline />
            <span>Görsel yüklenemedi</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
