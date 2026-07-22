"use client";

interface LoginHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginHelpModal({ isOpen, onClose }: LoginHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-paper-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h3 className="font-display text-base font-bold text-forest-deep">
            Saan makukuha ang Login Code?
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-paper hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-muted">
          <p>
            1. Ang <strong>Login Code</strong> ay awtomatikong nabubuo ng system kapag inirehistro ka ng iyong Landlord sa app.
          </p>
          <p>
            2. Maaari mo itong hingin sa iyong Property Owner o Landlord sa pamamagitan ng SMS o Chat.
          </p>
          <p>
            3. Ang format nito ay karaniwang may 6 na character (halimbawa: <code className="rounded bg-paper px-1.5 py-0.5 font-mono-brand font-bold text-forest-deep">TNT-8K2P9X</code>).
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-forest px-4 py-2.5 font-mono-brand text-xs font-bold text-white hover:bg-forest-deep"
        >
          Naintindihan Ko
        </button>
      </div>
    </div>
  );
}