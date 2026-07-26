"use client";

import { useState } from "react";
import { MaintenanceCategory, MaintenancePriority, MaintenanceTicket } from "@/src/types/tenant/tenant-maintenance";

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: Omit<MaintenanceTicket, "id" | "createdAt" | "status">) => void;
}

export function NewTicketModal({ isOpen, onClose, onSubmit }: NewTicketModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MaintenanceCategory>("Plumbing");
  const [priority, setPriority] = useState<MaintenancePriority>("Medium");
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🧹 Helper function para i-reset ang lahat ng form fields
  const resetForm = () => {
    setTitle("");
    setCategory("Plumbing");
    setPriority("Medium");
    setDescription("");
    setPhotoPreview(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      onSubmit({
        title,
        category,
        priority,
        description,
        photoUrl: photoPreview || undefined,
      });
      resetForm(); // ✨ I-reset ang form pagkatapos i-submit
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            {/* Wrench SVG Icon */}
            <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            <h3 className="font-display text-base font-bold text-forest-deep sm:text-lg">
              Mag-submit ng Repair Report
            </h3>
          </div>
          <button onClick={handleClose} className="rounded-full p-1.5 text-muted hover:bg-paper">
            {/* Close SVG Icon */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Ano ang sirang gamit / problema? *
            </label>
            <input
              type="text"
              placeholder="e.g. Tumatagas na gripo sa banyo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-xs font-bold text-forest-deep outline-none focus:border-forest focus:ring-2 focus:ring-forest/10"
              required
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Kategorya (Category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                className="w-full rounded-2xl border border-line bg-paper px-3.5 py-3 text-xs font-bold text-forest-deep outline-none focus:border-forest"
              >
                <option value="Plumbing">Plumbing (Tubig)</option>
                <option value="Electrical">Electrical (Kuryente/Ilaw)</option>
                <option value="Appliance">Appliance (Aircon/TV)</option>
                <option value="Structural">Structural (Pinto/Bintana)</option>
                <option value="Others">Iba pa (Others)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Antas ng Katindihan (Priority) *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                className="w-full rounded-2xl border border-line bg-paper px-3.5 py-3 text-xs font-bold text-forest-deep outline-none focus:border-forest"
              >
                <option value="Low">Low (Mababang Urgency)</option>
                <option value="Medium">Medium (Kailangan maayos)</option>
                <option value="High">High (Mabilisang aksyon)</option>
                <option value="Emergency">Emergency (Kritikal)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Paliwanag sa Sira (Details) *
            </label>
            <textarea
              rows={3}
              placeholder="Iliwanag kung saan eksakto ang sira at kailan ito nagsimula..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper p-3.5 text-xs text-forest-deep outline-none focus:border-forest focus:ring-2 focus:ring-forest/10"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Litrato ng Sira (Optional pero inirerekomenda)
            </label>
            <div className="relative mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-paper p-4 transition-colors hover:border-forest">
              {photoPreview ? (
                <div className="relative w-full space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Problem Preview"
                    className="h-36 w-full rounded-xl object-cover border border-line"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="w-full rounded-xl bg-coral/10 py-1.5 font-mono-brand text-[11px] font-bold text-coral-deep flex items-center justify-center gap-1"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Alisin ang Litrato
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer text-center">
                  <div className="rounded-full bg-forest/10 p-3 text-forest">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-xs font-bold text-forest">
                    I-click para mag-upload ng litrato ng sira
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-1/2 rounded-2xl border border-line py-3 font-mono-brand text-xs font-bold text-muted hover:bg-paper"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 rounded-2xl bg-forest py-3 font-mono-brand text-xs font-bold text-white shadow-md hover:bg-forest-deep disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isSubmitting ? "Ipinapadala..." : "I-submit Report"}</span>
              {!isSubmitting && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}