const Loader = ({
  size = "md",
  text = "Yükleniyor...",
  fullPage = false,
  showText = true,
  className = "",
}) => {
  const sizeMap = {
    sm: "1.25rem",
    md: "2rem",
    lg: "3rem",
  };

  const loaderContent = (
    <div
      className={[
        "d-flex flex-column align-items-center justify-content-center gap-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
    >
      <div
        className="spinner-border text-primary-custom"
        style={{
          width: sizeMap[size] ?? sizeMap.md,
          height: sizeMap[size] ?? sizeMap.md,
        }}
        aria-hidden="true"
      />

      {showText && <span className="text-secondary-custom">{text}</span>}

      <span className="visually-hidden">{text}</span>
    </div>
  );

  if (fullPage) {
    return <div className="page-loading">{loaderContent}</div>;
  }

  return loaderContent;
};

export default Loader;
