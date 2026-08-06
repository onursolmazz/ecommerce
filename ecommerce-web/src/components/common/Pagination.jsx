import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const Pagination = ({
  currentPage,
  lastPage,
  onPageChange,
  siblingCount = 1,
  className = "",
}) => {
  if (!lastPage || lastPage <= 1) {
    return null;
  }

  const createPageRange = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(lastPage, currentPage + siblingCount);

    if (startPage > 1) {
      pages.push(1);

      if (startPage > 2) {
        pages.push("start-ellipsis");
      }
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        pages.push("end-ellipsis");
      }

      pages.push(lastPage);
    }

    return pages;
  };

  const pages = createPageRange();

  const changePage = (page) => {
    if (page < 1 || page > lastPage || page === currentPage) {
      return;
    }

    onPageChange?.(page);
  };

  return (
    <nav className={className} aria-label="Sayfalama">
      <ul className="pagination justify-content-center mb-0">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Önceki sayfa"
          >
            <IoChevronBack />
          </button>
        </li>

        {pages.map((page) => {
          if (typeof page === "string") {
            return (
              <li key={page} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            );
          }

          return (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            </li>
          );
        })}

        <li
          className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}
        >
          <button
            type="button"
            className="page-link"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === lastPage}
            aria-label="Sonraki sayfa"
          >
            <IoChevronForward />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
