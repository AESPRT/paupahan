"use client";

import { ActivityNotification } from "@/src/types/dashboard";

const ACTIVITIES: ActivityNotification[] = [
  { id: "1", title: "Bagong Bayad Natanggap", description: "Nagbayad si Maria Clara ng ₱7,200 via GCash.", time: "10 mins ago", type: "payment" },
  { id: "2", title: "Bagong Tenant Registered", description: "Naidagdag si Ben Santos sa Unit 204.", time: "1 hr ago", type: "tenant" },
  { id: "3", title: "Maintenance Request", description: "Nasirang Gripo sa Unit 102.", time: "3 hrs ago", type: "maintenance" },
];

export function RecentActivities() {
  const getActivityIcon = (type: ActivityNotification["type"]) => {
    switch (type) {
      case "payment":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "tenant":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      case "maintenance":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm space-y-4">
      {/* Component Header with Bell SVG Icon */}
      <div className="flex items-center gap-2.5 border-b border-line pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <h3 className="font-display text-base font-bold text-forest-deep sm:text-lg">
          Huling Gawain at Notification
        </h3>
      </div>

      <div className="space-y-3">
        {ACTIVITIES.map((act) => (
          <div key={act.id} className="flex items-start gap-3 border-b border-line/40 pb-3 last:border-none last:pb-0">
            {getActivityIcon(act.type)}
            <div>
              <p className="text-xs font-bold text-forest-deep">{act.title}</p>
              <p className="text-xs text-muted">{act.description}</p>
              <span className="mt-1 inline-block font-mono-brand text-[10px] text-muted/70">{act.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}