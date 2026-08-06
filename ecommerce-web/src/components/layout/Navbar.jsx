import { Link, NavLink } from "react-router-dom";
import {
  HiOutlineHeart,
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-3" to="/">
          E-Commerce
        </Link>

        <button
          className="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar">
          <ul className="navbar-nav ms-4">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Ana Sayfa
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/products">
                Ürünler
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/categories">
                Kategoriler
              </NavLink>
            </li>
          </ul>

          <form className="mx-auto w-50">
            <div className="input-group">
              <input className="form-control" placeholder="Ürün ara..." />

              <button className="btn btn-dark">
                <HiOutlineMagnifyingGlass />
              </button>
            </div>
          </form>

          <div className="d-flex align-items-center gap-3">
            <NavLink to="/favorites" className="fs-4 text-dark">
              <HiOutlineHeart />
            </NavLink>

            <NavLink to="/cart" className="fs-4 text-dark">
              <HiOutlineShoppingCart />
            </NavLink>

            <NavLink to="/profile" className="fs-4 text-dark">
              <HiOutlineUser />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
