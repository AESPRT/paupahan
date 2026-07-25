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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-paper-card p-6 shadow-2xl space-y-5 text-center">
        
        {/* Playful Icon Container with ring & shadow */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-coral/10 text-coral-deep shadow-inner ring-4 ring-coral/10">
          {/* SVG Logout / Door Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h3 className="font-display text-lg font-black text-forest-deep">
            Sigurado ka bang gusto mong mag-Log Out?
          </h3>
          <p className="text-xs font-medium text-muted">
            Kailangan mong mag-sign in muli upang ma-access ang admin dashboard.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-line px-4 py-2.5 font-mono-brand text-xs font-bold text-muted hover:bg-paper transition-all cursor-pointer"
          >
            Kanselahin
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="w-full rounded-xl bg-coral px-4 py-2.5 font-mono-brand text-xs font-bold text-white shadow-md hover:bg-coral-deep active:scale-95 transition-all cursor-pointer"
          >
            Oo, Mag-Log Out
          </button>
        </div>
      </div>
    </div>
  );
}