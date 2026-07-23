"use client";

import { useState } from "react";

interface RevenueItem {
  month: string;
  val: number;
  amount: string;
}

interface RevenueChartProps {
  data?: RevenueItem[];
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  const [filter, setFilter] = useState<"6M" | "1Y">("6M");

  // Fallback kung sakaling walang data
  const chartData = data.length > 0 ? data : [
    { month: "Ene", val: 0, amount: "₱0" },
    { month: "Peb", val: 0, amount: "₱0" },
    { month: "Mar", val: 0, amount: "₱0" },
    { month: "Abr", val: 0, amount: "₱0" },
    { month: "May", val: 0, amount: "₱0" },
    { month: "Hun", val: 0, amount: "₱0" },
  ];

  // Kunin ang pinakamataas na value para magsilbing 100% height scale ng mga bars
  const maxVal = Math.max(...chartData.map((d) => d.val), 100);

  return (
    <div className="rounded-2xl border border-line bg-paper-card p-4 sm:p-5 shadow-sm">
      {/* Header & Filter Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-forest-deep">
            Kita at Koleksyon (Revenue Trends)
          </h3>
          <p className="text-[11px] sm:text-xs text-muted">
            Koleksyon ng renta at utilities mula sa database
          </p>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex self-start sm:self-auto rounded-xl border border-line bg-paper p-1 text-xs font-bold">
          <button
            onClick={() => setFilter("6M")}
            className={`rounded-lg px-2.5 py-1 text-[11px] sm:text-xs transition-colors ${
              filter === "6M"
                ? "bg-forest text-white"
                : "text-muted hover:text-forest-deep"
            }`}
          >
            6 Buwan
          </button>
          <button
            onClick={() => setFilter("1Y")}
            className={`rounded-lg px-2.5 py-1 text-[11px] sm:text-xs transition-colors ${
              filter === "1Y"
                ? "bg-forest text-white"
                : "text-muted hover:text-forest-deep"
            }`}
          >
            1 Taon
          </button>
        </div>
      </div>

      {/* Dynamic Chart Area */}
      <div className="mt-6 sm:mt-8 overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex h-44 sm:h-48 min-w-[320px] items-end justify-between gap-2 sm:gap-4 border-b border-line pb-2">
          {chartData.map((item) => {
            // Kalkulahin ang porsyento ng taas batay sa pinakamataas na kita
            const heightPercent = maxVal > 0 ? Math.max((item.val / maxVal) * 100, 8) : 8;

            return (
              <div
                key={item.month}
                className="group relative flex flex-1 flex-col items-center justify-end h-full gap-1.5"
              >
                {/* Tooltip para sa eksaktong halaga */}
                <span className="pointer-events-none rounded-md bg-forest-deep/90 sm:bg-forest-deep px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:absolute sm:-top-8 whitespace-nowrap">
                  {item.amount}
                </span>

                {/* Bar Visual na may dynamic height */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[28px] sm:max-w-[36px] rounded-t-xl bg-coral/80 transition-all group-hover:bg-coral group-active:scale-95"
                />

                {/* Label Month */}
                <span className="font-mono-brand text-[10px] sm:text-[11px] font-semibold text-muted">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}