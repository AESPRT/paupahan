import { ActivityNotification } from "@/src/types/dashboard";

const ACTIVITIES: ActivityNotification[] = [
  { id: "1", title: "Bagong Bayad Natanggap", description: "Nagbayad si Maria Clara ng ₱7,200 via GCash.", time: "10 mins ago", type: "payment" },
  { id: "2", title: "Bagong Tenant Registered", description: "Naidagdag si Ben Santos sa Unit 204.", time: "1 hr ago", type: "tenant" },
  { id: "3", title: "Maintenance Request", description: "Nasirang Gripo sa Unit 102.", time: "3 hrs ago", type: "maintenance" },
];

export function RecentActivities() {
  return (
    <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold text-forest-deep">
        🔔 Huling Gawain at Notification
      </h3>

      <div className="mt-4 space-y-3">
        {ACTIVITIES.map((act) => (
          <div key={act.id} className="flex gap-3 border-b border-line/40 pb-3 last:border-none last:pb-0">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-coral" />
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