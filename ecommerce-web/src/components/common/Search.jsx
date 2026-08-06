import { IoClose, IoSearch } from "react-icons/io5";

const Search = ({
  value = "",
  onChange,
  onSearch,
  placeholder = "Ara...",
  className = "",
  disabled = false,
}) => {
  const handleChange = (event) => {
    onChange?.(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(value.trim());
  };

  const handleClear = () => {
    onChange?.("");
    onSearch?.("");
  };

  return (
    <form
      className={`search-box ${className}`}
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="input-group">
        <span className="input-group-text bg-surface">
          <IoSearch />
        </span>

        <input
          type="search"
          className="form-control"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleChange}
          aria-label={placeholder}
        />

        {value && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClear}
            aria-label="Aramayı temizle"
          >
            <IoClose />
          </button>
        )}

        <button type="submit" className="btn btn-primary" disabled={disabled}>
          Ara
        </button>
      </div>
    </form>
  );
};

export default Search;
