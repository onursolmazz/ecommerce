import { Link } from "react-router-dom";
import {
  IoBagHandleOutline,
  IoCallOutline,
  IoLogoFacebook,
  IoLogoGithub,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoMailOutline,
  IoLocationOutline,
} from "react-icons/io5";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="container-custom">
          <div className="footer-grid">
            <div className="footer-brand-column">
              <Link to="/" className="footer-logo">
                <span className="footer-logo-icon">
                  <IoBagHandleOutline />
                </span>

                <span>E-Commerce</span>
              </Link>

              <p className="footer-description">
                Güvenli alışveriş, kaliteli ürünler ve hızlı teslimat deneyimi
                sunan modern e-ticaret platformu.
              </p>

              <div className="footer-social-links">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <IoLogoInstagram />
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <IoLogoFacebook />
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                >
                  <IoLogoTwitter />
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <IoLogoLinkedin />
                </a>

                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <IoLogoGithub />
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h3>Alışveriş</h3>

              <ul className="footer-links">
                <li>
                  <Link to="/products">Tüm Ürünler</Link>
                </li>

                <li>
                  <Link to="/categories">Kategoriler</Link>
                </li>

                <li>
                  <Link to="/favorites">Favoriler</Link>
                </li>

                <li>
                  <Link to="/cart">Sepetim</Link>
                </li>

                <li>
                  <Link to="/orders">Siparişlerim</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Kurumsal</h3>

              <ul className="footer-links">
                <li>
                  <Link to="/about">Hakkımızda</Link>
                </li>

                <li>
                  <Link to="/contact">İletişim</Link>
                </li>

                <li>
                  <Link to="/privacy">Gizlilik Politikası</Link>
                </li>

                <li>
                  <Link to="/terms">Kullanım Koşulları</Link>
                </li>

                <li>
                  <Link to="/faq">Sıkça Sorulan Sorular</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Hesabım</h3>

              <ul className="footer-links">
                <li>
                  <Link to="/login">Giriş Yap</Link>
                </li>

                <li>
                  <Link to="/register">Kayıt Ol</Link>
                </li>

                <li>
                  <Link to="/profile">Profilim</Link>
                </li>

                <li>
                  <Link to="/orders">Sipariş Takibi</Link>
                </li>

                <li>
                  <Link to="/dashboard">Satıcı Paneli</Link>
                </li>
              </ul>
            </div>

            <div className="footer-column footer-contact-column">
              <h3>İletişim</h3>

              <ul className="footer-contact-list">
                <li>
                  <IoLocationOutline />

                  <span>İstanbul, Türkiye</span>
                </li>

                <li>
                  <IoCallOutline />

                  <a href="tel:+905555555555">+90 555 555 55 55</a>
                </li>

                <li>
                  <IoMailOutline />

                  <a href="mailto:info@ecommerce.com">info@ecommerce.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container-custom footer-bottom-content">
          <p>© {currentYear} E-Commerce. Tüm hakları saklıdır.</p>

          <div className="footer-bottom-links">
            <Link to="/privacy">Gizlilik</Link>

            <Link to="/terms">Koşullar</Link>

            <Link to="/cookies">Çerezler</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
