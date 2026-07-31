"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface BedsSummaryProps {
  data: {
    totalUnits: number;
    vacantUnits?: number;
    reservedUnits?: number;
    occupiedUnits?: number;
    totalRooms: number;     // Total Beds
    availableRooms: number; // Available Beds
    reservedRooms?: number;  // Reserved Beds
    occupiedRooms: number;  // Occupied Beds
  };
}

export function RoomsSummaryChart({ data }: BedsSummaryProps) {
  const vacantUnits = data.vacantUnits ?? 0;
  const reservedUnits = data.reservedUnits ?? 0;
  const occupiedUnits = data.occupiedUnits ?? 0;
  const reservedRooms = data.reservedRooms ?? 0;

  // Pinagsama sa 2 rows/categories lang para sa Stacked Bar Chart
  const chartData = [
    {
      category: "Units",
      Available: vacantUnits,
      Reserved: reservedUnits,
      Occupied: occupiedUnits,
    },
    {
      category: "Beds",
      Available: data.availableRooms ?? 0,
      Reserved: reservedRooms,
      Occupied: data.occupiedRooms ?? 0,
    },
  ];

  const hasData = data.totalUnits > 0 || data.totalRooms > 0;

  return (
    <div className="rounded-3xl border border-line bg-paper-card p-6 shadow-sm">
      {/* Chart Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-forest-deep">Units & Beds Occupancy Chart</h2>
          <p className="text-xs text-muted">Visual distribution ng mga Status sa Units at Beds.</p>
        </div>
      </div>

      {/* Horizontal Stacked Bar Chart */}
      <div className="h-64 w-full flex items-center justify-center">
        {!hasData ? (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted">
            Walang pang nakatalang units o beds.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical" 
              margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                allowDecimals={false} 
                tick={{ fontSize: 11, fill: "#6b7280" }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                dataKey="category" 
                type="category" 
                tick={{ fontSize: 13, fill: "#374151", fontWeight: "bold" }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
              />
              <Legend 
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} 
                iconType="circle"
              />
              
              {/* Stacked Bars gamit ang stackId="a" */}
              <Bar dataKey="Available" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={32} />
              <Bar dataKey="Reserved" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={32} />
              <Bar dataKey="Occupied" stackId="a" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}