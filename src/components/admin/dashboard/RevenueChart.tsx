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
  onFilterChange?: (filter: "3M" | "6M" | "1Y" | "ALL") => Promise<RevenueItem[]>;
}

export function RevenueChart({ data = [], onFilterChange }: RevenueChartProps) {
  const [filter, setFilter] = useState<"3M" | "6M" | "1Y" | "ALL">("6M");
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

  const handleFilterClick = (newFilter: "3M" | "6M" | "1Y" | "ALL") => {
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
    <div className="relative overflow-hidden rounded-3xl border border-line bg-paper-card p-6 shadow-sm transition-all duration-300 hover:shadow-md sm:p-8">
      
      {/* Background Decorative Glow (Playful Touch) */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-marigold/10 blur-3xl" />

      {/* Header & Filter Toggle */}
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper text-forest border border-line shadow-sm">
            {/* Chart/Trend Icon */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-bold text-muted border border-line mb-1 font-mono-brand">
              📈 FINANCIAL INSIGHTS
            </div>
            <h3 className="text-lg font-black tracking-tight text-ink font-display">
              Kita at Koleksyon Trends
            </h3>
            <p className="text-xs text-muted font-body">
              Paghambing ng Paid, Pending, at Overdue bills bawat buwan.
            </p>
          </div>
        </div>

        {/* Filter Toggle Buttons (Playful & Rounded) */}
        <div className="flex flex-wrap items-center gap-1 self-start sm:self-auto rounded-2xl border border-line bg-paper p-1.5 shadow-inner">
          {(["3M", "6M", "1Y", "ALL"] as const).map((item) => (
            <button
              key={item}
              onClick={() => handleFilterClick(item)}
              disabled={isPending}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all font-mono-brand ${
                filter === item 
                  ? "bg-forest text-paper-card shadow-md scale-105" 
                  : "text-muted hover:text-ink hover:bg-line/40"
              }`}
            >
              {item === "3M" && "3 Buwan"}
              {item === "6M" && "6 Buwan"}
              {item === "1Y" && "1 Taon"}
              {item === "ALL" && "Lahat"}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Line Chart Area */}
      <div className={`relative z-10 mt-6 h-72 sm:h-80 w-full transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line, #e4ddc9)" />
            <XAxis 
              dataKey="month" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 11, fill: 'var(--muted, #6b7b74)', fontFamily: 'var(--font-mono-brand)' }} 
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 11, fill: 'var(--muted, #6b7b74)', fontFamily: 'var(--font-mono-brand)' }}
              tickFormatter={(value) => `₱${value >= 1000 ? `${value / 1000}k` : value}`}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const itemData = payload[0].payload as RevenueItem;
                  return (
                    <div className="rounded-2xl bg-forest-deep px-4 py-3 text-white shadow-2xl text-xs space-y-1.5 border border-white/10 backdrop-blur-md">
                      <p className="font-display font-bold text-marigold border-b border-white/15 pb-1 mb-1 tracking-wide">{label}</p>
                      <p className="flex justify-between gap-4 text-emerald-300">
                        <span>Paid:</span> <span className="font-mono-brand font-bold">{itemData.paidFormatted}</span>
                      </p>
                      <p className="flex justify-between gap-4 text-amber-300">
                        <span>Pending:</span> <span className="font-mono-brand font-bold">{itemData.pendingFormatted}</span>
                      </p>
                      <p className="flex justify-between gap-4 text-coral">
                        <span>Overdue:</span> <span className="font-mono-brand font-bold">{itemData.overdueFormatted}</span>
                      </p>
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
              formatter={(value) => <span className="text-xs font-bold text-ink font-mono-brand capitalize">{value}</span>}
            />
            {/* Paid Line (Forest Theme) */}
            <Line 
              type="monotone" 
              dataKey="paid" 
              name="Paid"
              stroke="var(--forest, #1f4b3f)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "var(--forest, #1f4b3f)", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "var(--marigold)" }} 
            />
            {/* Pending Line (Marigold Theme) */}
            <Line 
              type="monotone" 
              dataKey="pending" 
              name="Pending"
              stroke="var(--marigold, #f0a93a)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "var(--marigold, #f0a93a)", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "var(--forest)" }} 
            />
            {/* Overdue Line (Coral Theme) */}
            <Line 
              type="monotone" 
              dataKey="overdue" 
              name="Overdue"
              stroke="var(--coral, #e15b4e)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: "var(--coral, #e15b4e)", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "var(--ink)" }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}