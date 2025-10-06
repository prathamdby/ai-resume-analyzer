interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
}

const DeleteConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="surface-card surface-card--tight mx-4 w-full max-w-md space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Delete "{title}"?
          </h2>
          <p className="text-sm text-slate-600">
            This will permanently remove the resume and its analysis. This
            action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full border border-red-200/70 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-200/70"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
