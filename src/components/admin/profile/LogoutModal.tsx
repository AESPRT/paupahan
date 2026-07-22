"use client";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirmLogout,
}: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-paper-card p-6 shadow-xl animate-in fade-in zoom-in duration-200 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-2xl">
          🚪
        </div>

        <h3 className="mt-4 font-display text-lg font-bold text-forest-deep">
          Sigurado ka bang gusto mong mag-Log Out?
        </h3>
        <p className="mt-1 text-xs text-muted">
          Kailangan mong mag-sign in muli upang ma-access ang admin dashboard.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-line px-4 py-2.5 font-mono-brand text-xs font-bold text-muted hover:bg-paper"
          >
            Kanselahin
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="w-full rounded-xl bg-coral px-4 py-2.5 font-mono-brand text-xs font-bold text-white shadow-sm hover:bg-coral-deep"
          >
            Oo, Mag-Log Out
          </button>
        </div>
      </div>
    </div>
  );
}