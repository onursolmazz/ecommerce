import { useEffect, useId, useMemo } from "react";
import { IoCloudUploadOutline, IoClose, IoImageOutline } from "react-icons/io5";

const ImageUpload = ({
  name = "images",
  multiple = true,
  maxFiles = 8,
  maxSize = 5,
  accept = "image/jpeg,image/png,image/webp",
  value = [],
  onChange,
  error = "",
  disabled = false,
}) => {
  const inputId = useId();

  const previews = useMemo(() => {
    return value.map((item) => {
      if (item instanceof File) {
        return {
          file: item,
          url: URL.createObjectURL(item),
          isObjectUrl: true,
        };
      }

      return {
        file: item,
        url: item?.url ?? item?.path ?? item,
        isObjectUrl: false,
      };
    });
  }, [value]);

  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        if (item.isObjectUrl) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [previews]);

  const acceptedTypes = accept.split(",").map((type) => type.trim());

  const handleFiles = (selectedFiles) => {
    const files = Array.from(selectedFiles ?? []);

    const validFiles = files.filter((file) => {
      const fileSizeInMb = file.size / 1024 / 1024;

      return acceptedTypes.includes(file.type) && fileSizeInMb <= maxSize;
    });

    const existingFiles = multiple ? value : [];

    const nextFiles = [...existingFiles, ...validFiles].slice(
      0,
      multiple ? maxFiles : 1,
    );

    onChange?.(nextFiles);
  };

  const handleInputChange = (event) => {
    handleFiles(event.target.files);

    // Aynı dosyanın tekrar seçilebilmesini sağlar.
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    handleFiles(event.dataTransfer.files);
  };

  const removeImage = (index) => {
    const nextFiles = value.filter((_, itemIndex) => itemIndex !== index);

    onChange?.(nextFiles);
  };

  return (
    <div className="image-upload">
      <label
        htmlFor={inputId}
        className={[
          "image-upload-dropzone",
          error ? "is-invalid" : "",
          disabled ? "disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          id={inputId}
          name={name}
          type="file"
          className="d-none"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
        />

        <IoCloudUploadOutline size={42} />

        <strong className="mt-3">Görselleri seç veya buraya sürükle</strong>

        <span className="text-secondary-custom mt-1">
          PNG, JPG veya WEBP — en fazla {maxSize} MB
        </span>

        {multiple && (
          <small className="text-muted-custom mt-1">
            En fazla {maxFiles} görsel yükleyebilirsin.
          </small>
        )}
      </label>

      {error && <div className="invalid-feedback d-block">{error}</div>}

      {previews.length > 0 && (
        <div className="image-upload-preview-grid mt-3">
          {previews.map((preview, index) => (
            <div
              className="image-upload-preview"
              key={`${preview.url}-${index}`}
            >
              {preview.url ? (
                <img src={preview.url} alt={`Ürün görseli ${index + 1}`} />
              ) : (
                <IoImageOutline size={36} />
              )}

              {index === 0 && (
                <span className="image-primary-badge">Ana görsel</span>
              )}

              <button
                type="button"
                className="image-remove-button"
                onClick={() => removeImage(index)}
                aria-label={`${index + 1}. görseli kaldır`}
                disabled={disabled}
              >
                <IoClose />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
