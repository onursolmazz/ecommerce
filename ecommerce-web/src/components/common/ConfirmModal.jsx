import { IoAlertCircleOutline, IoTrashOutline } from "react-icons/io5";
import Button from "./Button";
import Modal from "./Modal";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "İşlemi onaylıyor musunuz?",
  description = "Bu işlem geri alınamaz.",
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  variant = "danger",
  loading = false,
  icon = null,
}) => {
  const defaultIcon =
    variant === "danger" ? (
      <IoTrashOutline size={34} />
    ) : (
      <IoAlertCircleOutline size={34} />
    );

  const footer = (
    <>
      <Button variant="outline-secondary" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>

      <Button variant={variant} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      showCloseButton={!loading}
      size="sm"
    >
      <div className="text-center py-3">
        <div
          className={`mb-3 ${
            variant === "danger" ? "text-danger" : "text-warning"
          }`}
        >
          {icon ?? defaultIcon}
        </div>

        <p className="mb-0">{description}</p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
