import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = "",
}) => {
  const titleId = useId();

  const sizeClasses = {
    sm: "modal-sm",
    md: "",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onMouseDown={handleBackdropClick}
      >
        <div
          className={[
            "modal-dialog modal-dialog-centered",
            sizeClasses[size] ?? "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="modal-content border-0 shadow-lg">
            {(title || showCloseButton) && (
              <div className="modal-header">
                {title && (
                  <h5 id={titleId} className="modal-title mb-0">
                    {title}
                  </h5>
                )}

                {showCloseButton && (
                  <button
                    type="button"
                    className="btn-close-custom ms-auto"
                    onClick={onClose}
                    aria-label="Kapat"
                  >
                    <IoClose size={24} />
                  </button>
                )}
              </div>
            )}

            <div className="modal-body">{children}</div>

            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>,
    document.body,
  );
};

export default Modal;
