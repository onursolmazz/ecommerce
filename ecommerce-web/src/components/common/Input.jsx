import { forwardRef, useId } from "react";

const Input = forwardRef(
  (
    {
      label,
      name,
      type = "text",
      value,
      placeholder = "",
      error = "",
      helperText = "",
      required = false,
      disabled = false,
      readOnly = false,
      icon = null,
      className = "",
      inputClassName = "",
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = props.id ?? name ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className={`form-group mb-3 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="form-label fw-semibold">
            {label}

            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}

        <div className={icon ? "input-group" : undefined}>
          {icon && <span className="input-group-text">{icon}</span>}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            onChange={onChange}
            className={[
              "form-control",
              error ? "is-invalid" : "",
              inputClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            {...props}
          />
        </div>

        {error && (
          <div id={errorId} className="invalid-feedback d-block">
            {error}
          </div>
        )}

        {!error && helperText && (
          <div id={helperId} className="form-text text-secondary-custom">
            {helperText}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
