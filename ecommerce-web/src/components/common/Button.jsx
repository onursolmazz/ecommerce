import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      type = "button",
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      icon = null,
      iconPosition = "left",
      className = "",
      onClick,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "btn-sm",
      md: "",
      lg: "btn-lg",
    };

    const buttonClassName = [
      "btn",
      `btn-${variant}`,
      sizeClasses[size] ?? "",
      fullWidth ? "w-100" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClassName}
        disabled={disabled || loading}
        onClick={onClick}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              aria-hidden="true"
            />
            <span>Yükleniyor...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="me-2">{icon}</span>
            )}

            {children}

            {icon && iconPosition === "right" && (
              <span className="ms-2">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
