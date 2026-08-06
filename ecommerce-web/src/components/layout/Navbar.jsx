import { Link, NavLink } from "react-router-dom";
import {
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";

function Navbar() {
  const cartCount = 1;
  const favoriteCount = 1;

  return (
    <nav className="navbar navbar-expand-lg navbar-custom sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          E-Commerce
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar">
          <ul className="navbar-nav ms-lg-4">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/"
              >
                Ana Sayfa
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/products"
              >
                Ürünler
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
                to="/categories"
              >
                Kategoriler
              </NavLink>
            </li>
          </ul>

          <form className="navbar-search mx-lg-auto my-3 my-lg-0">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Ürün ara..."
              />

              <button className="btn btn-primary" type="submit">
                <HiOutlineMagnifyingGlass />
              </button>
            </div>
          </form>

          <div className="navbar-actions d-flex align-items-center gap-3">
            <NavLink to="/favorites" className="navbar-icon">
              <HiOutlineHeart />

              {favoriteCount > 0 && (
                <span className="badge-count">{favoriteCount}</span>
              )}
            </NavLink>

            <NavLink to="/cart" className="navbar-icon">
              <HiOutlineShoppingCart />

              {cartCount > 0 && (
                <span className="badge-count">{cartCount}</span>
              )}
            </NavLink>

            <NavLink to="/profile" className="navbar-icon">
              <HiOutlineUser />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
