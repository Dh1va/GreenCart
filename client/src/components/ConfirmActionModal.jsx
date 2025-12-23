import React from "react";

const ConfirmActionModal = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>

        <p className="text-sm text-gray-500 mt-2">{description}</p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-black disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm text-white rounded disabled:opacity-60 ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-primary hover:bg-primary-dull"
            }`}
          >
            {loading ? "Please wait…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
