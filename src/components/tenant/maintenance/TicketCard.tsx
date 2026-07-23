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
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-paper-card p-5 shadow-sm transition-all hover:border-forest/40 md:flex-row md:items-start md:justify-between">
      
      {/* Details Container */}
      <div className="space-y-3 flex-1">
        <div className="flex flex-wrap items-center gap-2">
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
            {ticket.priority} Priority
          </span>
        </div>

        <div>
          <h3 className="font-display text-base font-bold text-forest-deep">
            {ticket.title}
          </h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Admin Remarks if any */}
        {ticket.adminRemark && (
          <div className="flex items-start gap-2 rounded-2xl bg-paper p-3 border border-line/60 text-xs">
            {/* Chat / Speech Bubble SVG Icon */}
            <svg className="h-4 w-4 shrink-0 text-forest mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div>
              <span className="font-bold text-forest">Sagot ng Landlord: </span>
              <span className="text-forest-deep">{ticket.adminRemark}</span>
            </div>
          </div>
        )}

        {/* Footer Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted font-mono-brand pt-1">
          {/* Category with Folder SVG Icon */}
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>Category: {ticket.category}</span>
          </div>

          {/* Date with Calendar SVG Icon */}
          <div className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Petsa: {ticket.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Photo Attachment Preview if present */}
      {ticket.photoUrl && (
        <div className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ticket.photoUrl}
            alt={ticket.title}
            className="h-28 w-full rounded-2xl object-cover border border-line md:w-28"
          />
        </div>
      )}
    </div>
  );
}