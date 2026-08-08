"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LucideIcon, Wallet } from "lucide-react";

export interface PriceRangeZone {
    /** Absolute value (in the same units as min/max) this zone tops out at. */
    upTo: number;
    label: string;
    color: string;
    icon?: LucideIcon;
}

interface PriceRangeSliderProps {
    min?: number;
    max?: number;
    step?: number;
    value: number;
    onChange: (value: number) => void;
    label?: string;
    /** Every N pesos, draw a tick mark. Set to 0 to disable. */
    tickInterval?: number;
    formatValue?: (value: number) => string;
    /** Custom budget tiers. Defaults to three even thirds of the min–max range. */
    zones?: PriceRangeZone[];
    hint?: string;
}

const defaultFormat = (v: number) => `₱${v.toLocaleString("en-PH")}`;

function buildDefaultZones(min: number, max: number): PriceRangeZone[] {
    const span = max - min;
    return [
        { upTo: min + span * 0.33, label: "Affordable", color: "#2F9E6B" },
        { upTo: min + span * 0.66, label: "Mid-range", color: "#F5B400" },
        { upTo: max, label: "Premium", color: "#E07A1F" },
    ];
}

function getZone(zones: PriceRangeZone[], value: number) {
    return zones.find((z) => value <= z.upTo) ?? zones[zones.length - 1];
}

export function PriceRangeSlider({
    min = 3000,
    max = 50000,
    step = 1000,
    value,
    onChange,
    label = "Budget",
    tickInterval = 5000,
    formatValue = defaultFormat,
    zones,
    hint,
}: PriceRangeSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [justSettled, setJustSettled] = useState(false);

    const resolvedZones = useMemo(() => zones ?? buildDefaultZones(min, max), [zones, min, max]);

    const percent = useMemo(() => {
        const raw = ((value - min) / (max - min)) * 100;
        return Math.min(100, Math.max(0, raw));
    }, [value, min, max]);

    const zone = getZone(resolvedZones, value);
    const ZoneIcon = zone.icon;

    const ticks = useMemo(() => {
        if (!tickInterval) return [];
        const marks: number[] = [];
        for (let t = min; t <= max; t += tickInterval) marks.push(t);
        return marks;
    }, [min, max, tickInterval]);

    const valueFromClientX = useCallback(
        (clientX: number) => {
            const track = trackRef.current;
            if (!track) return value;
            const rect = track.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
            const raw = min + ratio * (max - min);
            const stepped = Math.round(raw / step) * step;
            return Math.min(max, Math.max(min, stepped));
        },
        [min, max, step, value]
    );

    const commit = useCallback(
        (clientX: number) => {
            const next = valueFromClientX(clientX);
            if (next !== value) onChange(next);
        },
        [valueFromClientX, value, onChange]
    );

    // Pointer drag handling — bound to window so the thumb tracks the
    // cursor even when it moves faster than the thumb itself.
    useEffect(() => {
        if (!isDragging) return;

        const handleMove = (e: PointerEvent) => commit(e.clientX);
        const handleUp = () => {
            setIsDragging(false);
            setJustSettled(true);
            window.setTimeout(() => setJustSettled(false), 260);
        };

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp);
        return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("pointerup", handleUp);
        };
    }, [isDragging, commit]);

    const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        commit(e.clientX);
        setIsDragging(true);
    };

    const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const bigStep = step * 5;
        switch (e.key) {
            case "ArrowRight":
            case "ArrowUp":
                e.preventDefault();
                onChange(Math.min(max, value + step));
                break;
            case "ArrowLeft":
            case "ArrowDown":
                e.preventDefault();
                onChange(Math.max(min, value - step));
                break;
            case "PageUp":
                e.preventDefault();
                onChange(Math.min(max, value + bigStep));
                break;
            case "PageDown":
                e.preventDefault();
                onChange(Math.max(min, value - bigStep));
                break;
            case "Home":
                e.preventDefault();
                onChange(min);
                break;
            case "End":
                e.preventDefault();
                onChange(max);
                break;
        }
    };

    const showTooltip = isDragging || isHovering;

    return (
        <div className="select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-[var(--muted)]" strokeWidth={2.5} />
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--muted)]">
                        {label}
                    </label>
                </div>
                <span
                    className="inline-flex items-center gap-1 font-display font-black text-xs px-2.5 py-0.5 rounded-lg transition-colors duration-200"
                    style={{
                        color: zone.color,
                        backgroundColor: `${zone.color}1F`,
                    }}
                >
                    {ZoneIcon && <ZoneIcon className="h-3 w-3" />}
                    {zone.label}
                </span>
            </div>

            {/* Slider body — extra top padding reserves room for the floating tooltip */}
            <div className="relative pt-9 pb-1">
                {/* Floating value tooltip */}
                <div
                    className="absolute top-0 -translate-x-1/2 transition-all duration-200 ease-out pointer-events-none"
                    style={{
                        left: `${percent}%`,
                        opacity: showTooltip ? 1 : 0,
                        transform: `translateX(-50%) translateY(${showTooltip ? "0px" : "4px"}) ${
                            isDragging ? "scale(1.04)" : "scale(1)"
                        }`,
                    }}
                >
                    <div className="relative rounded-xl bg-[var(--forest-deep)]/90 backdrop-blur-md px-3 py-1.5 shadow-[0_8px_20px_-4px_rgba(31,94,74,0.45)]">
                        <span className="font-display font-black text-xs text-white tabular-nums whitespace-nowrap">
                            {formatValue(value)}
                        </span>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-2 w-2 rotate-45 bg-[var(--forest-deep)]/90" />
                    </div>
                </div>

                {/* Track */}
                <div
                    ref={trackRef}
                    role="slider"
                    tabIndex={0}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                    aria-label={label}
                    onPointerDown={handleTrackPointerDown}
                    onKeyDown={handleKeyDown}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onFocus={() => setIsHovering(true)}
                    onBlur={() => setIsHovering(false)}
                    className="group relative h-2.5 rounded-full bg-[var(--paper)] border border-[var(--line)] cursor-pointer touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest-deep)] focus-visible:ring-offset-2"
                >
                    {/* Budget zone underlay — subtle, sits under the fill */}
                    <div className="absolute inset-0 rounded-full overflow-hidden flex opacity-40">
                        {resolvedZones.map((z, i) => {
                            const prevUpTo = i === 0 ? min : resolvedZones[i - 1].upTo;
                            const width = ((z.upTo - prevUpTo) / (max - min)) * 100;
                            return (
                                <div
                                    key={z.label}
                                    style={{ width: `${width}%`, backgroundColor: z.color }}
                                    className="h-full"
                                />
                            );
                        })}
                    </div>

                    {/* Tick marks */}
                    {ticks.map((t) => {
                        const tp = ((t - min) / (max - min)) * 100;
                        return (
                            <div
                                key={t}
                                className="absolute top-1/2 -translate-y-1/2 h-1 w-px bg-white/70"
                                style={{ left: `${tp}%` }}
                            />
                        );
                    })}

                    {/* Filled progress track */}
                    <div
                        className="absolute inset-y-0 left-0 rounded-full overflow-hidden transition-[width] duration-150 ease-out"
                        style={{ width: `${percent}%` }}
                    >
                        <div
                            className={`h-full w-full bg-[linear-gradient(90deg,var(--forest-deep),#2F9E6B,var(--forest-deep))] bg-[length:200%_100%] ${
                                isDragging ? "animate-[premium-slider-flow_1.4s_linear_infinite]" : ""
                            }`}
                        />
                        {/* Soft glow while dragging */}
                        <div
                            className="absolute inset-0 rounded-full transition-opacity duration-200"
                            style={{
                                boxShadow: "0 0 14px 2px rgba(31,94,74,0.55)",
                                opacity: isDragging ? 1 : 0,
                            }}
                        />
                    </div>

                    {/* Thumb */}
                    <div
                        onPointerDown={handleThumbPointerDown}
                        className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-[3px] border-[var(--forest-deep)] shadow-[0_2px_8px_rgba(31,94,74,0.35)] transition-transform duration-150 ease-out ${
                            isDragging
                                ? "scale-110 cursor-grabbing"
                                : "hover:scale-110 active:scale-95 cursor-grab"
                        } ${justSettled ? "animate-[premium-slider-settle_0.26s_ease-out]" : ""}`}
                        style={{ left: `${percent}%`, transformOrigin: "center" }}
                    >
                        {/* Ripple pulse while actively dragging */}
                        {isDragging && (
                            <span className="absolute inset-0 rounded-full bg-[var(--forest-deep)]/30 animate-ping" />
                        )}
                    </div>
                </div>

                {/* Min / max labels */}
                <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-[var(--muted)] tabular-nums">
                    <span>{formatValue(min)}</span>
                    {hint && (
                        <span className="hidden sm:inline text-[9px] font-semibold tracking-wider uppercase text-[var(--muted)]/60">
                            {hint}
                        </span>
                    )}
                    <span>{formatValue(max)}</span>
                </div>
            </div>
        </div>
    );
}