import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLocationOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
  IoPhonePortraitOutline,
  IoSaveOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { updatePassword, updateProfile } from "../../api/authApi";
import { fetchMe } from "../../store/auth/authThunk";

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") {
    return error;
  }

  return error?.message ?? error?.response?.data?.message ?? fallbackMessage;
};

const Profile = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user);

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    city: user?.city ?? "",
    district: user?.district ?? "",
    address: user?.address ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [profileErrors, setProfileErrors] = useState({});

  const [passwordErrors, setPasswordErrors] = useState({});

  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));

    setProfileErrors((current) => ({
      ...current,
      [name]: null,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordErrors((current) => ({
      ...current,
      [name]: null,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (profileLoading) {
      return;
    }

    setProfileLoading(true);
    setProfileErrors({});

    try {
      const response = await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim() || null,
        city: profileForm.city.trim() || null,
        district: profileForm.district.trim() || null,
        address: profileForm.address.trim() || null,
      });

      await dispatch(fetchMe()).unwrap();

      toast.success(response?.data?.message ?? "Profil bilgileri güncellendi.");
    } catch (error) {
      const validationErrors = error?.response?.data?.errors ?? {};

      const normalizedErrors = {};

      Object.entries(validationErrors).forEach(([field, messages]) => {
        normalizedErrors[field] = Array.isArray(messages)
          ? messages[0]
          : messages;
      });

      setProfileErrors(normalizedErrors);

      toast.error(getErrorMessage(error, "Profil bilgileri güncellenemedi."));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (passwordLoading) {
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({});

    try {
      const response = await updatePassword(passwordForm);

      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });

      toast.success(
        response?.data?.message ?? "Şifreniz başarıyla güncellendi.",
      );
    } catch (error) {
      const validationErrors = error?.response?.data?.errors ?? {};

      const normalizedErrors = {};

      Object.entries(validationErrors).forEach(([field, messages]) => {
        normalizedErrors[field] = Array.isArray(messages)
          ? messages[0]
          : messages;
      });

      setPasswordErrors(normalizedErrors);

      toast.error(getErrorMessage(error, "Şifre güncellenemedi."));
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="profile-page">
      <div className="container-custom">
        <div className="profile-page-header">
          <div>
            <span>Hesap ayarları</span>
            <h1>Profilim</h1>
            <p>Kişisel bilgilerinizi ve güvenlik ayarlarınızı yönetin.</p>
          </div>
        </div>

        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar">
              {initials || <IoPersonOutline />}
            </div>

            <h2>{user?.name ?? "Kullanıcı"}</h2>
            <p>{user?.email}</p>

            <div className="profile-role">
              <IoShieldCheckmarkOutline />

              <span>{user?.role?.name ?? user?.role?.slug ?? "Customer"}</span>
            </div>
          </aside>

          <div className="profile-content">
            <form
              className="profile-section"
              onSubmit={handleProfileSubmit}
              noValidate
            >
              <div className="profile-section-header">
                <div>
                  <h2>Kişisel Bilgiler</h2>
                  <p>İletişim ve teslimat bilgilerinizi düzenleyin.</p>
                </div>
              </div>

              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label htmlFor="name">Ad Soyad</label>

                  <div className="profile-input-wrapper">
                    <IoPersonOutline />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className={profileErrors.name ? "is-invalid" : ""}
                    />
                  </div>

                  {profileErrors.name && (
                    <span className="profile-error">{profileErrors.name}</span>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="email">E-posta</label>

                  <div className="profile-input-wrapper">
                    <IoMailOutline />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className={profileErrors.email ? "is-invalid" : ""}
                    />
                  </div>

                  {profileErrors.email && (
                    <span className="profile-error">{profileErrors.email}</span>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="phone">Telefon</label>

                  <div className="profile-input-wrapper">
                    <IoPhonePortraitOutline />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="05XX XXX XX XX"
                    />
                  </div>

                  {profileErrors.phone && (
                    <span className="profile-error">{profileErrors.phone}</span>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="city">Şehir</label>

                  <div className="profile-input-wrapper">
                    <IoLocationOutline />

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={profileForm.city}
                      onChange={handleProfileChange}
                      placeholder="Şehir"
                    />
                  </div>

                  {profileErrors.city && (
                    <span className="profile-error">{profileErrors.city}</span>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="district">İlçe</label>

                  <input
                    id="district"
                    name="district"
                    type="text"
                    value={profileForm.district}
                    onChange={handleProfileChange}
                    placeholder="İlçe"
                  />

                  {profileErrors.district && (
                    <span className="profile-error">
                      {profileErrors.district}
                    </span>
                  )}
                </div>

                <div className="profile-form-group profile-form-full">
                  <label htmlFor="address">Adres</label>

                  <textarea
                    id="address"
                    name="address"
                    rows="5"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    placeholder="Açık adresiniz"
                  />

                  {profileErrors.address && (
                    <span className="profile-error">
                      {profileErrors.address}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="profile-save-button"
                disabled={profileLoading}
              >
                <IoSaveOutline />

                {profileLoading ? "Kaydediliyor..." : "Bilgileri Kaydet"}
              </button>
            </form>

            <form
              className="profile-section"
              onSubmit={handlePasswordSubmit}
              noValidate
            >
              <div className="profile-section-header">
                <div>
                  <h2>Şifre Değiştir</h2>
                  <p>Hesabınız için güçlü bir şifre belirleyin.</p>
                </div>
              </div>

              <div className="profile-password-grid">
                <div className="profile-form-group">
                  <label htmlFor="current_password">Mevcut Şifre</label>

                  <div className="profile-password-wrapper">
                    <IoLockClosedOutline />

                    <input
                      id="current_password"
                      name="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current_password}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword((current) => !current)
                      }
                      aria-label="Mevcut şifreyi göster veya gizle"
                    >
                      {showCurrentPassword ? (
                        <IoEyeOffOutline />
                      ) : (
                        <IoEyeOutline />
                      )}
                    </button>
                  </div>

                  {passwordErrors.current_password && (
                    <span className="profile-error">
                      {passwordErrors.current_password}
                    </span>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="password">Yeni Şifre</label>

                  <div className="profile-password-wrapper">
                    <IoLockClosedOutline />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.password}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label="Yeni şifreyi göster veya gizle"
                    >
                      {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    </button>
                  </div>

                  {passwordErrors.password && (
                    <span className="profile-error">
                      {passwordErrors.password}
                    </span>
                  )}
                </div>

                <div className="profile-form-group">
                  <label htmlFor="password_confirmation">
                    Yeni Şifre Tekrar
                  </label>

                  <div className="profile-password-wrapper">
                    <IoLockClosedOutline />

                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showPasswordConfirmation ? "text" : "password"}
                      value={passwordForm.password_confirmation}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirmation((current) => !current)
                      }
                      aria-label="Şifre tekrarını göster veya gizle"
                    >
                      {showPasswordConfirmation ? (
                        <IoEyeOffOutline />
                      ) : (
                        <IoEyeOutline />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="profile-save-button"
                disabled={passwordLoading}
              >
                <IoLockClosedOutline />

                {passwordLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
