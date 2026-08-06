import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  IoBagHandleOutline,
  IoCartOutline,
  IoChevronDown,
  IoClose,
  IoHeartOutline,
  IoHomeOutline,
  IoLanguageOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoMenu,
  IoNotificationsOutline,
  IoPersonAddOutline,
  IoPersonCircleOutline,
  IoSearchOutline,
  IoSettingsOutline,
} from "react-icons/io5";

import { logoutUser } from "../../store/auth/authThunk";

import { fetchCart } from "../../store/cart/cartThunk";
import { resetCart } from "../../store/cart/cartSlice";

import { fetchFavorites } from "../../store/favorite/favoriteThunk";
import { resetFavorites } from "../../store/favorite/favoriteSlice";

import { fetchNotifications } from "../../store/notification/notificationThunk";
import { clearNotifications } from "../../store/notification/notificationSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const authState = useSelector((state) => state.auth);

  const cartState = useSelector((state) => state.cart);

  const favoriteState = useSelector((state) => state.favorite);

  const notificationState = useSelector((state) => state.notification);

  const user = authState?.user ?? null;

  const isAuthenticated = authState?.isAuthenticated ?? Boolean(user);

  const authLoading = authState?.loading ?? authState?.isLoading ?? false;

  const cartItems = Array.isArray(cartState?.items) ? cartState.items : [];

  const favoriteItems = Array.isArray(favoriteState?.items)
    ? favoriteState.items
    : [];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const cartCount = Number(
    cartState?.totalQuantity ??
      cartItems.reduce((total, item) => total + Number(item?.quantity ?? 0), 0),
  );

  const favoriteCount = Number(favoriteState?.total ?? favoriteItems.length);

  const notificationCount = Number(notificationState?.unreadCount ?? 0);

  const roleName = String(
    user?.role?.slug ?? user?.role?.name ?? user?.role ?? "customer",
  ).toLowerCase();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    dispatch(fetchCart());
    dispatch(fetchFavorites());
    dispatch(
      fetchNotifications({
        per_page: 20,
      }),
    );
  }, [dispatch, isAuthenticated]);

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setSearchOpen(false);
  };

  const handleNavigation = () => {
    closeMenus();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) {
      return;
    }

    navigate(`/products?search=${encodeURIComponent(query)}`);

    setSearchValue("");
    closeMenus();
  };

  const handleSearchClear = () => {
    setSearchValue("");
  };

  const handleLanguageChange = async () => {
    const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? "tr";

    const nextLanguage = currentLanguage.startsWith("tr") ? "en" : "tr";

    await i18n.changeLanguage(nextLanguage);

    localStorage.setItem("language", nextLanguage);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Çıkış işlemi başarısız:", error);
    } finally {
      dispatch(resetCart());
      dispatch(resetFavorites());
      dispatch(clearNotifications());

      closeMenus();

      navigate("/login", {
        replace: true,
      });
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen((previousValue) => !previousValue);

    setProfileMenuOpen(false);
    setSearchOpen(false);
  };

  const handleProfileMenuToggle = () => {
    setProfileMenuOpen((previousValue) => !previousValue);

    setSearchOpen(false);
  };

  const handleSearchToggle = () => {
    setSearchOpen((previousValue) => !previousValue);

    setProfileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (roleName === "admin" || roleName === "seller") {
      return "/dashboard";
    }

    return "/profile";
  };

  const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? "tr";

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg ecommerce-navbar">
        <div className="container-custom">
          <Link
            to="/"
            className="navbar-brand ecommerce-logo"
            onClick={handleNavigation}
          >
            <span className="ecommerce-logo-icon">
              <IoBagHandleOutline />
            </span>

            <span className="ecommerce-logo-text">E-Commerce</span>
          </Link>

          <div className="navbar-mobile-actions">
            {isAuthenticated && (
              <>
                <NavLink
                  to="/notifications"
                  className="navbar-icon-button"
                  aria-label="Bildirimler"
                  onClick={handleNavigation}
                >
                  <IoNotificationsOutline />

                  {notificationCount > 0 && (
                    <span className="navbar-count-badge">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/favorites"
                  className="navbar-icon-button"
                  aria-label="Favoriler"
                  onClick={handleNavigation}
                >
                  <IoHeartOutline />

                  {favoriteCount > 0 && (
                    <span className="navbar-count-badge">
                      {favoriteCount > 99 ? "99+" : favoriteCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/cart"
                  className="navbar-icon-button"
                  aria-label="Sepet"
                  onClick={handleNavigation}
                >
                  <IoCartOutline />

                  {cartCount > 0 && (
                    <span className="navbar-count-badge">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </NavLink>
              </>
            )}

            <button
              type="button"
              className="navbar-menu-button"
              onClick={handleMobileMenuToggle}
              aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <IoClose /> : <IoMenu />}
            </button>
          </div>

          <div
            className={[
              "navbar-collapse",
              "ecommerce-navbar-collapse",
              mobileMenuOpen ? "show" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <ul className="navbar-nav ecommerce-nav-links">
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    ["nav-link", isActive ? "active" : ""]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <IoHomeOutline />
                  <span>Ana Sayfa</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/products"
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    ["nav-link", isActive ? "active" : ""]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <IoBagHandleOutline />
                  <span>Ürünler</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/categories"
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    ["nav-link", isActive ? "active" : ""]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <span>Kategoriler</span>
                </NavLink>
              </li>
            </ul>

            <div className="navbar-search-wrapper">
              <form
                className={["navbar-search", searchOpen ? "show" : ""]
                  .filter(Boolean)
                  .join(" ")}
                onSubmit={handleSearchSubmit}
                role="search"
              >
                <IoSearchOutline />

                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Ürün ara..."
                  aria-label="Ürün ara"
                />

                {searchValue && (
                  <button
                    type="button"
                    onClick={handleSearchClear}
                    aria-label="Aramayı temizle"
                  >
                    <IoClose />
                  </button>
                )}
              </form>

              <button
                type="button"
                className="navbar-search-toggle"
                onClick={handleSearchToggle}
                aria-label="Arama alanını aç"
                aria-expanded={searchOpen}
              >
                <IoSearchOutline />
              </button>
            </div>

            <div className="navbar-actions">
              <button
                type="button"
                className="navbar-icon-button"
                onClick={handleLanguageChange}
                aria-label="Dili değiştir"
                title="Dili değiştir"
              >
                <IoLanguageOutline />

                <span className="navbar-language-text">
                  {currentLanguage.startsWith("tr") ? "TR" : "EN"}
                </span>
              </button>

              {isAuthenticated && (
                <>
                  <NavLink
                    to="/notifications"
                    className="navbar-icon-button navbar-desktop-action"
                    aria-label="Bildirimler"
                    title="Bildirimler"
                    onClick={handleNavigation}
                  >
                    <IoNotificationsOutline />

                    {notificationCount > 0 && (
                      <span className="navbar-count-badge">
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </NavLink>

                  <NavLink
                    to="/favorites"
                    className="navbar-icon-button navbar-desktop-action"
                    aria-label="Favoriler"
                    title="Favoriler"
                    onClick={handleNavigation}
                  >
                    <IoHeartOutline />

                    {favoriteCount > 0 && (
                      <span className="navbar-count-badge">
                        {favoriteCount > 99 ? "99+" : favoriteCount}
                      </span>
                    )}
                  </NavLink>

                  <NavLink
                    to="/cart"
                    className="navbar-icon-button navbar-desktop-action"
                    aria-label="Sepet"
                    title="Sepet"
                    onClick={handleNavigation}
                  >
                    <IoCartOutline />

                    {cartCount > 0 && (
                      <span className="navbar-count-badge">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </NavLink>
                </>
              )}

              {isAuthenticated ? (
                <div className="navbar-profile">
                  <button
                    type="button"
                    className="navbar-profile-button"
                    onClick={handleProfileMenuToggle}
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span className="navbar-user-avatar">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.name ?? "Kullanıcı"}
                        />
                      ) : (
                        <IoPersonCircleOutline />
                      )}
                    </span>

                    <span className="navbar-user-info">
                      <strong>{user?.name ?? "Kullanıcı"}</strong>

                      <small>{roleName}</small>
                    </span>

                    <IoChevronDown
                      className={profileMenuOpen ? "rotate" : ""}
                    />
                  </button>

                  {profileMenuOpen && (
                    <div className="navbar-profile-menu" role="menu">
                      <Link
                        to="/profile"
                        className="navbar-profile-menu-item"
                        onClick={handleNavigation}
                        role="menuitem"
                      >
                        <IoPersonCircleOutline />
                        <span>Profilim</span>
                      </Link>

                      <Link
                        to="/notifications"
                        className="navbar-profile-menu-item"
                        onClick={handleNavigation}
                        role="menuitem"
                      >
                        <IoNotificationsOutline />

                        <span>Bildirimler</span>

                        {notificationCount > 0 && (
                          <strong className="navbar-menu-count">
                            {notificationCount > 99 ? "99+" : notificationCount}
                          </strong>
                        )}
                      </Link>

                      <Link
                        to="/orders"
                        className="navbar-profile-menu-item"
                        onClick={handleNavigation}
                        role="menuitem"
                      >
                        <IoBagHandleOutline />
                        <span>Siparişlerim</span>
                      </Link>

                      {(roleName === "admin" || roleName === "seller") && (
                        <Link
                          to={getDashboardPath()}
                          className="navbar-profile-menu-item"
                          onClick={handleNavigation}
                          role="menuitem"
                        >
                          <IoSettingsOutline />
                          <span>Yönetim Paneli</span>
                        </Link>
                      )}

                      <div className="navbar-profile-divider" />

                      <button
                        type="button"
                        className="navbar-profile-menu-item navbar-logout-button"
                        onClick={handleLogout}
                        disabled={authLoading}
                        role="menuitem"
                      >
                        <IoLogOutOutline />

                        <span>
                          {authLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="navbar-auth-buttons">
                  <Link
                    to="/login"
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleNavigation}
                  >
                    <IoLogInOutline />
                    <span>Giriş Yap</span>
                  </Link>

                  <Link
                    to="/register"
                    className="btn btn-primary btn-sm"
                    onClick={handleNavigation}
                  >
                    <IoPersonAddOutline />
                    <span>Kayıt Ol</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
