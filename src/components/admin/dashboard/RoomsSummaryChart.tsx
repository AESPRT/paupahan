"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RoomsSummaryProps {
  data: {
    totalUnits: number;
    availableRooms: number;
    occupiedRooms: number;
    totalRooms: number;
  };
}

export function RoomsSummaryChart({ data }: RoomsSummaryProps) {
  // Data para sa Bar Chart
  const chartData = [
    { name: "Total Units", count: data.totalUnits, fill: "#3b82f6" },     // Blue
    { name: "Total Rooms", count: data.totalRooms, fill: "#6366f1" },     // Indigo
    { name: "Available", count: data.availableRooms, fill: "#10b981" },   // Green
    { name: "Occupied", count: data.occupiedRooms, fill: "#f59e0b" },     // Amber
  ];

  const occupancyRate = data.totalRooms > 0 ? Math.round((data.occupiedRooms / data.totalRooms) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 rounded-3xl border border-line bg-paper-card p-6 shadow-sm">
      {/* Kaliwang bahagi: Mga impormasyon at numero */}
      <div className="flex flex-col justify-center space-y-4 lg:col-span-1">
        <div>
          <h2 className="font-display text-lg font-bold text-forest-deep">Room Occupancy Summary</h2>
          <p className="text-xs text-muted">Kabuuang status ng mga silid sa iyong mga paupahan.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-line bg-paper p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Units</p>
            <p className="font-display text-xl font-bold text-forest-deep">{data.totalUnits}</p>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Rooms</p>
            <p className="font-display text-xl font-bold text-forest-deep">{data.totalRooms}</p>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Available</p>
            <p className="font-display text-xl font-bold text-emerald-700">{data.availableRooms}</p>
          </div>
          <div className="rounded-2xl border border-line bg-paper p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Occupied</p>
            <p className="font-display text-xl font-bold text-amber-700">{data.occupiedRooms}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-forest/5 p-3 text-center">
          <span className="text-xs font-bold text-forest-deep">Occupancy Rate: </span>
          <span className="font-display text-sm font-bold text-forest">{occupancyRate}%</span>
        </div>
      </div>

      {/* Kanang bahagi: Ang Bar Chart */}
      <div className="h-64 w-full lg:col-span-2 flex items-center justify-center">
        {data.totalRooms === 0 && data.totalUnits === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            Walang pang nakatalang rooms o units.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11, fill: "#6b7280" }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                tick={{ fontSize: 11, fill: "#6b7280" }} 
                axisLine={false} 
                tickLine={false} 
                allowDecimals={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}