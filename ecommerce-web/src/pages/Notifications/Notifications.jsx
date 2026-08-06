import { useEffect, useState } from "react";
import {
  IoBagCheckOutline,
  IoCheckmarkDoneOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoHeartOutline,
  IoNotificationsOutline,
  IoPricetagOutline,
  IoReceiptOutline,
  IoTrashOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteNotification,
  getNotifications,
  readAllNotifications,
  readNotification,
} from "../../api/notificationApi";
import formatDate from "../../utils/formatDate";

const extractNotifications = (response) => {
  const body = response?.data ?? response;

  return (
    [
      body?.data,
      body?.data?.data,
      body?.notifications,
      body?.result,
      body,
    ].find(Array.isArray) ?? []
  );
};

const getErrorMessage = (error, fallbackMessage) => {
  if (typeof error === "string") {
    return error;
  }

  return error?.response?.data?.message ?? error?.message ?? fallbackMessage;
};

const isNotificationRead = (notification) =>
  notification?.is_read === true ||
  notification?.is_read === 1 ||
  notification?.is_read === "1";

const getNotificationConfig = (type) => {
  const configs = {
    order: {
      icon: IoReceiptOutline,
      className: "order",
    },
    success: {
      icon: IoBagCheckOutline,
      className: "success",
    },
    favorite: {
      icon: IoHeartOutline,
      className: "favorite",
    },
    campaign: {
      icon: IoPricetagOutline,
      className: "campaign",
    },
  };

  return (
    configs[type] ?? {
      icon: IoNotificationsOutline,
      className: "default",
    }
  );
};

const NotificationsSkeleton = () => (
  <div className="notification-list">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="notification-item notification-item-skeleton">
        <div className="skeleton notification-skeleton-icon" />

        <div className="notification-skeleton-content">
          <div className="skeleton skeleton-line skeleton-line-sm" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line-md" />
        </div>
      </div>
    ))}
  </div>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [readActionId, setReadActionId] = useState(null);
  const [readAllLoading, setReadAllLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loading = !loaded;

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        const response = await getNotifications();

        if (!active) {
          return;
        }

        setNotifications(extractNotifications(response));
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "Bildirim listeleme hatası:",
          error?.response?.data ?? error,
        );

        toast.error(getErrorMessage(error, "Bildirimler yüklenemedi."));

        setNotifications([]);
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showDeleteModal) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape" && !deleteLoading) {
        setShowDeleteModal(false);
        setSelectedNotification(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showDeleteModal, deleteLoading]);

  const unreadCount = notifications.filter(
    (notification) => !isNotificationRead(notification),
  ).length;

  const closeDeleteModal = () => {
    if (deleteLoading) {
      return;
    }

    setShowDeleteModal(false);
    setSelectedNotification(null);
  };

  const openDeleteModal = (event, notification) => {
    event.stopPropagation();

    if (!notification?.id || deleteLoading) {
      return;
    }

    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  const handleRead = async (notification) => {
    if (
      !notification?.id ||
      isNotificationRead(notification) ||
      readActionId !== null ||
      deleteLoading
    ) {
      return;
    }

    setReadActionId(notification.id);

    try {
      await readNotification(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          Number(item.id) === Number(notification.id)
            ? {
                ...item,
                is_read: true,
              }
            : item,
        ),
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Bildirim okundu olarak işaretlenemedi."),
      );
    } finally {
      setReadActionId(null);
    }
  };

  const handleNotificationKeyDown = (event, notification) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRead(notification);
    }
  };

  const handleReadAll = async () => {
    if (unreadCount === 0 || readAllLoading || deleteLoading) {
      return;
    }

    setReadAllLoading(true);

    try {
      const response = await readAllNotifications();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );

      toast.success(
        response?.data?.message ?? "Tüm bildirimler okundu olarak işaretlendi.",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Bildirimler güncellenemedi."));
    } finally {
      setReadAllLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNotification?.id || deleteLoading) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await deleteNotification(selectedNotification.id);

      setNotifications((current) =>
        current.filter(
          (item) => Number(item.id) !== Number(selectedNotification.id),
        ),
      );

      toast.success(response?.data?.message ?? "Bildirim başarıyla silindi.");

      setShowDeleteModal(false);
      setSelectedNotification(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Bildirim silinemedi."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !deleteLoading) {
      closeDeleteModal();
    }
  };

  if (loading) {
    return (
      <main className="notification-page">
        <div className="container-custom">
          <div className="notification-page-header">
            <div>
              <span>Hesap bildirimleri</span>
              <h1>Bildirimler</h1>
              <p>Bildirimlerin yükleniyor.</p>
            </div>
          </div>

          <NotificationsSkeleton />
        </div>
      </main>
    );
  }

  if (!notifications.length) {
    return (
      <main className="notification-page">
        <div className="container-custom">
          <div className="notification-empty">
            <div className="notification-empty-icon">
              <IoNotificationsOutline />
            </div>

            <h1>Henüz bildirimin yok</h1>

            <p>
              Sipariş, kampanya ve hesap güncellemeleri burada gösterilecek.
            </p>

            <Link to="/products" className="notification-empty-button">
              Ürünleri Keşfet
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="notification-page">
        <div className="container-custom">
          <div className="notification-page-header">
            <div>
              <span>Hesap bildirimleri</span>

              <h1>Bildirimler</h1>

              <p>
                {unreadCount > 0
                  ? `${unreadCount} okunmamış bildirimin var.`
                  : "Tüm bildirimlerini okudun."}
              </p>
            </div>

            <button
              type="button"
              className="notification-read-all-button"
              onClick={handleReadAll}
              disabled={unreadCount === 0 || readAllLoading || deleteLoading}
            >
              {readAllLoading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  aria-hidden="true"
                />
              ) : (
                <IoCheckmarkDoneOutline />
              )}

              {readAllLoading ? "Güncelleniyor..." : "Tümünü Okundu Yap"}
            </button>
          </div>

          <div className="notification-list">
            {notifications.map((notification) => {
              const config = getNotificationConfig(notification?.type);

              const NotificationIcon = config.icon;
              const read = isNotificationRead(notification);

              const itemReading =
                Number(readActionId) === Number(notification.id);

              return (
                <article
                  key={notification.id}
                  className={[
                    "notification-item",
                    read ? "read" : "unread",
                    !read ? "clickable" : "",
                    itemReading ? "loading" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleRead(notification)}
                  onKeyDown={(event) =>
                    handleNotificationKeyDown(event, notification)
                  }
                  role={!read ? "button" : undefined}
                  tabIndex={!read ? 0 : -1}
                  aria-label={
                    !read
                      ? `${
                          notification?.title ?? "Bildirim"
                        } bildirimini okundu yap`
                      : undefined
                  }
                >
                  <div
                    className={[
                      "notification-item-icon",
                      config.className,
                    ].join(" ")}
                  >
                    <NotificationIcon />
                  </div>

                  <div className="notification-item-content">
                    <div className="notification-item-heading">
                      <h2>{notification?.title ?? "Bildirim"}</h2>

                      {!read && (
                        <span className="notification-unread-badge">Yeni</span>
                      )}
                    </div>

                    <p>
                      {notification?.message ?? "Bildirim içeriği bulunmuyor."}
                    </p>

                    <time dateTime={notification?.created_at}>
                      {formatDate(notification?.created_at)}
                    </time>
                  </div>

                  <div className="notification-item-actions">
                    <div className="notification-item-status">
                      {itemReading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          aria-hidden="true"
                        />
                      ) : read ? (
                        <>
                          <IoCheckmarkOutline />
                          <span>Okundu</span>
                        </>
                      ) : (
                        <>
                          <IoCheckmarkOutline />
                          <span>Okundu yap</span>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      className="notification-delete-button"
                      onClick={(event) => openDeleteModal(event, notification)}
                      disabled={deleteLoading || itemReading}
                      aria-label="Bildirimi sil"
                      title="Bildirimi sil"
                    >
                      <IoTrashOutline />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div
          className="notification-modal-backdrop"
          onMouseDown={handleBackdropClick}
          role="presentation"
        >
          <div
            className="notification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-delete-title"
            aria-describedby="notification-delete-description"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="notification-modal-header">
              <div className="notification-modal-title">
                <span className="notification-modal-warning-icon">
                  <IoWarningOutline />
                </span>

                <div>
                  <h2 id="notification-delete-title">Bildirimi Sil</h2>

                  <span>Bu işlem geri alınamaz</span>
                </div>
              </div>

              <button
                type="button"
                className="notification-modal-close"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                aria-label="Modalı kapat"
              >
                <IoCloseOutline />
              </button>
            </div>

            <div className="notification-modal-body">
              <p id="notification-delete-description">
                Bu bildirimi kalıcı olarak silmek istediğinize emin misiniz?
              </p>

              {selectedNotification?.title && (
                <div className="notification-modal-selected">
                  <IoNotificationsOutline />

                  <div>
                    <strong>{selectedNotification.title}</strong>

                    {selectedNotification?.message && (
                      <span>{selectedNotification.message}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="notification-modal-footer">
              <button
                type="button"
                className="notification-modal-cancel"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
              >
                Vazgeç
              </button>

              <button
                type="button"
                className="notification-modal-delete"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <IoTrashOutline />
                    Bildirimi Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;
