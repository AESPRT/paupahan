import { MaintenanceTicket } from "@/src/types/tenant/tenant-maintenance";

interface TicketCardProps {
  ticket: MaintenanceTicket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const getStatusBadge = (status: MaintenanceTicket["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Rejected":
        return "bg-rose-100 text-rose-800 border-rose-300";
    }
  };

  const getPriorityBadge = (priority: MaintenanceTicket["priority"]) => {
    switch (priority) {
      case "Emergency":
        return "bg-rose-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-amber-500 text-white";
      case "Low":
        return "bg-slate-400 text-white";
    }
  };

  return (
    <div className="flex flex-col justify-between gap-4 rounded-3xl border border-line bg-paper-card p-5 shadow-sm transition-all hover:border-forest/40">
      
      {/* 🖼️ Playful Hover Image Container */}
      {ticket.photoUrl && (
        <div className="group relative w-full overflow-hidden rounded-2xl border border-line bg-paper shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ticket.photoUrl}
            alt={ticket.title}
            className="h-36 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          
          {/* Playful Gradient Overlay with Icon on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
            <span className="flex items-center gap-1.5 rounded-xl bg-white/90 backdrop-blur-md px-2.5 py-1 font-mono-brand text-[10px] font-bold text-forest-deep shadow-md transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
              <svg className="h-3.5 w-3.5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              I-hover para sa full view
            </span>
          </div>
        </div>
      )}

      {/* Details Container */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Ticket ID */}
            <span className="font-mono-brand text-[10px] font-bold text-muted">
              {ticket.id}
            </span>

            {/* Status Badge */}
            <span className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(ticket.status)}`}>
              {ticket.status}
            </span>

            {/* Priority Badge */}
            <span className={`rounded-md px-2 py-0.5 font-mono-brand text-[9px] font-bold ${getPriorityBadge(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-forest-deep line-clamp-1">
              {ticket.title}
            </h3>
            <p className="mt-1 text-xs text-muted leading-relaxed line-clamp-2">
              {ticket.description}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Admin Remarks if any */}
          {ticket.adminRemark && (
            <div className="flex items-start gap-2 rounded-2xl bg-paper p-3 border border-line/60 text-xs">
              {/* Chat / Speech Bubble SVG Icon */}
              <svg className="h-4 w-4 shrink-0 text-forest mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div className="line-clamp-2">
                <span className="font-bold text-forest">Sagot: </span>
                <span className="text-forest-deep">{ticket.adminRemark}</span>
              </div>
            </div>
          )}

          {/* Footer Meta Info */}
          <div className="flex flex-col gap-1.5 text-[10px] text-muted font-mono-brand pt-1 border-t border-line/50">
            {/* Category with Folder SVG Icon */}
            <div className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="truncate">Category: {ticket.category}</span>
            </div>

            {/* Date with Calendar SVG Icon */}
            <div className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="truncate">Petsa: {ticket.createdAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}