import { IoFileTrayOutline } from "react-icons/io5";
import Button from "./Button";

const Empty = ({
  title = "Henüz veri bulunmuyor",
  description = "Görüntülenecek bir içerik bulunamadı.",
  icon = <IoFileTrayOutline size={56} />,
  actionText = "",
  onAction,
  className = "",
}) => {
  return (
    <div
      className={["empty-state text-center py-5 px-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="empty-state-icon mb-3 text-secondary-custom">{icon}</div>

      <h3 className="h5 mb-2">{title}</h3>

      {description && <p className="mb-4">{description}</p>}

      {actionText && onAction && (
        <Button onClick={onAction}>{actionText}</Button>
      )}
    </div>
  );
};

export default Empty;
