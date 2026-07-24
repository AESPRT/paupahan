"use client";

import { useState, useTransition } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface RevenueItem {
  month: string;
  paid: number;
  pending: number;
  overdue: number;
  paidFormatted: string;
  pendingFormatted: string;
  overdueFormatted: string;
}

interface RevenueChartProps {
  data?: RevenueItem[];
  onFilterChange?: (filter: "6M" | "1Y") => Promise<RevenueItem[]>;
}

export function RevenueChart({ data = [], onFilterChange }: RevenueChartProps) {
  const [filter, setFilter] = useState<"6M" | "1Y">("6M");
  const [chartData, setChartData] = useState<RevenueItem[]>(
    data.length > 0
      ? data
      : [
          { month: "Ene", paid: 0, pending: 0, overdue: 0, paidFormatted: "₱0", pendingFormatted: "₱0", overdueFormatted: "₱0" },
          { month: "Peb", paid: 0, pending: 0, overdue: 0, paidFormatted: "₱0", pendingFormatted: "₱0", overdueFormatted: "₱0" },
          { month: "Mar", paid: 0, pending: 0, overdue: 0, paidFormatted: "₱0", pendingFormatted: "₱0", overdueFormatted: "₱0" },
          { month: "Abr", paid: 0, pending: 0, overdue: 0, paidFormatted: "₱0", pendingFormatted: "₱0", overdueFormatted: "₱0" },
          { month: "May", paid: 0, pending: 0, overdue: 0, paidFormatted: "₱0", pendingFormatted: "₱0", overdueFormatted: "₱0" },
          { month: "Hun", paid: 0, pending: 0, overdue: 0, paidFormatted: "₱0", pendingFormatted: "₱0", overdueFormatted: "₱0" },
        ]
  );
  const [isPending, startTransition] = useTransition();

  const handleFilterClick = (newFilter: "6M" | "1Y") => {
    setFilter(newFilter);
    if (onFilterChange) {
      startTransition(async () => {
        const newData = await onFilterChange(newFilter);
        if (newData && newData.length > 0) {
          setChartData(newData);
        }
      });
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-card p-4 sm:p-5 shadow-sm">
      {/* Header & Filter Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-forest-deep">
            Kita at Koleksyon Trends
          </h3>
          <p className="text-[11px] sm:text-xs text-muted">
            Paghambing ng Paid, Pending, at Overdue bills bawat buwan
          </p>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex self-start sm:self-auto rounded-xl border border-line bg-paper p-1 text-xs font-bold">
          <button
            onClick={() => handleFilterClick("6M")}
            disabled={isPending}
            className={`rounded-lg px-3 py-1 text-[11px] sm:text-xs transition-colors ${
              filter === "6M" ? "bg-forest text-white shadow-sm" : "text-muted hover:text-forest-deep"
            }`}
          >
            6 Buwan
          </button>
          <button
            onClick={() => handleFilterClick("1Y")}
            disabled={isPending}
            className={`rounded-lg px-3 py-1 text-[11px] sm:text-xs transition-colors ${
              filter === "1Y" ? "bg-forest text-white shadow-sm" : "text-muted hover:text-forest-deep"
            }`}
          >
            1 Taon
          </button>
        </div>
      </div>

      {/* Multi-Line Chart Area */}
      <div className={`mt-6 h-72 sm:h-80 w-full transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-line, #e5e7eb)" />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 11, fill: 'var(--muted, #6b7280)' }} 
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 11, fill: 'var(--muted, #6b7280)' }}
              tickFormatter={(value) => `₱${value >= 1000 ? `${value / 1000}k` : value}`}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as RevenueItem;
                  return (
                    <div className="rounded-xl bg-forest-deep px-3 py-2.5 text-white shadow-xl text-xs space-y-1">
                      <p className="font-bold border-b border-white/20 pb-1 mb-1">{label}</p>
                      <p className="text-emerald-400">Paid: <span className="font-bold">{data.paidFormatted}</span></p>
                      <p className="text-amber-400">Pending: <span className="font-bold">{data.pendingFormatted}</span></p>
                      <p className="text-rose-400">Overdue: <span className="font-bold">{data.overdueFormatted}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span className="text-xs font-semibold text-forest-deep capitalize">{value}</span>}
            />
            {/* Paid Line (Green/Forest) */}
            <Line 
              type="monotone" 
              dataKey="paid" 
              name="Paid"
              stroke="#10b981" 
              strokeWidth={2.5} 
              dot={{ r: 3, fill: "#10b981" }}
              activeDot={{ r: 5 }} 
            />
            {/* Pending Line (Amber/Yellow) */}
            <Line 
              type="monotone" 
              dataKey="pending" 
              name="Pending"
              stroke="#f59e0b" 
              strokeWidth={2.5} 
              dot={{ r: 3, fill: "#f59e0b" }}
              activeDot={{ r: 5 }} 
            />
            {/* Overdue Line (Coral/Red) */}
            <Line 
              type="monotone" 
              dataKey="overdue" 
              name="Overdue"
              stroke="#f43f5e" 
              strokeWidth={2.5} 
              dot={{ r: 3, fill: "#f43f5e" }}
              activeDot={{ r: 5 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}