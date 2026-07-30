// ==========================================
// REUSABLE EMPTY STATE COMPONENT
// ==========================================
"use client";

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onReset: () => void;
}

export function EmptyState({
    title = "Wala kaming nahanap na tugma.",
    description = "Subukang dagdagan ang badyet, baguhin ang lungsod, o alisin ang ilang filter para makita ang iba pang pagpipilian.",
    actionLabel = "I-reset ang mga Filter",
    onReset,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-line bg-paper-card overflow-hidden">

            {/* ── Scene SVG ── */}
            <svg
                className="w-full max-w-[420px] h-auto mb-2"
                viewBox="0 0 400 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Isang bahay na hinahanap ng magnifying glass"
            >
                {/* Background ambient circles */}
                <circle cx="340" cy="60" r="55" fill="#EEF7FB" opacity="0.7" />
                <circle cx="55" cy="80" r="42" fill="#F0EEEA" opacity="0.5" />
                <circle cx="200" cy="230" r="70" fill="#F5F0E8" opacity="0.45" />

                {/* ── Clouds ── */}
                <g className="es-cloud1">
                    <ellipse cx="68" cy="42" rx="26" ry="13" fill="white" opacity="0.9" />
                    <ellipse cx="80" cy="38" rx="18" ry="12" fill="white" opacity="0.85" />
                    <ellipse cx="56" cy="46" rx="14" ry="9" fill="white" opacity="0.75" />
                </g>
                <g className="es-cloud2">
                    <ellipse cx="330" cy="36" rx="30" ry="14" fill="white" opacity="0.9" />
                    <ellipse cx="345" cy="31" rx="20" ry="12" fill="white" opacity="0.85" />
                    <ellipse cx="318" cy="40" rx="15" ry="10" fill="white" opacity="0.75" />
                </g>

                {/* ── Bird ── */}
                <g className="es-bird">
                    <path d="M50 35 Q54 30 58 33" stroke="#153730" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M58 33 Q62 30 66 34" stroke="#153730" strokeWidth="1.8" strokeLinecap="round" />
                </g>

                {/* ── Falling leaves ── */}
                <g className="es-leaf1">
                    <ellipse cx="95" cy="110" rx="6" ry="3.5" fill="#4A7C59" opacity="0.8" transform="rotate(-30 95 110)" />
                </g>
                <g className="es-leaf2">
                    <ellipse cx="315" cy="90" rx="5" ry="3" fill="#5A9060" opacity="0.75" transform="rotate(20 315 90)" />
                </g>
                <g className="es-leaf3">
                    <ellipse cx="270" cy="130" rx="5.5" ry="3" fill="#4A7C59" opacity="0.7" transform="rotate(-15 270 130)" />
                </g>

                {/* ── Ground / grass ── */}
                <ellipse cx="200" cy="235" rx="150" ry="18" fill="#D9EDD3" opacity="0.5" />
                <path d="M78 230 Q82 222 86 230" stroke="#5A9060" strokeWidth="2" strokeLinecap="round" />
                <path d="M88 228 Q91 221 94 228" stroke="#4A7C59" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M306 229 Q310 221 314 229" stroke="#5A9060" strokeWidth="2" strokeLinecap="round" />
                <path d="M314 227 Q317 222 320 227" stroke="#4A7C59" strokeWidth="1.5" strokeLinecap="round" />

                {/* Stone path */}
                <ellipse cx="200" cy="238" rx="22" ry="5" fill="#E0D6C4" opacity="0.8" />
                <ellipse cx="185" cy="244" rx="14" ry="4" fill="#D8CEBC" opacity="0.7" />
                <ellipse cx="215" cy="244" rx="14" ry="4" fill="#D8CEBC" opacity="0.7" />

                {/* Ground shadow (pulses with house) */}
                <ellipse className="es-shadow" cx="200" cy="234" rx="42" ry="8" fill="#153730" opacity="0.18" />

                {/* ── Little tree (left) ── */}
                <rect x="100" y="185" width="8" height="32" rx="3" fill="#A0784E" />
                <ellipse cx="104" cy="172" rx="18" ry="22" fill="#2D6A5A" opacity="0.9" />
                <ellipse cx="104" cy="165" rx="13" ry="16" fill="#3D8060" opacity="0.85" />
                <circle cx="96" cy="168" r="3" fill="#D97D3A" opacity="0.9" />
                <circle cx="110" cy="174" r="2.5" fill="#D97D3A" opacity="0.85" />
                <circle cx="102" cy="180" r="2" fill="#D97D3A" opacity="0.8" />

                {/* ── Mailbox (right) ── */}
                <rect x="298" y="198" width="6" height="32" rx="2" fill="#A0784E" />
                <rect x="287" y="186" width="28" height="18" rx="5" fill="#C86B3A" />
                <ellipse cx="301" cy="186" rx="14" ry="5" fill="#D97D3A" />
                <rect x="299" y="189" width="4" height="9" rx="1.5" fill="#FAF7EF" />
                <rect x="313" y="188" width="2.5" height="10" rx="1" fill="#888" />
                <rect x="313" y="188" width="10" height="6" rx="1.5" fill="#F0A93A" />

                {/* ── Flower pot (left of door) ── */}
                <rect x="165" y="213" width="13" height="10" rx="3" fill="#C86B3A" />
                <path d="M163 213 L179 213" stroke="#B05A2E" strokeWidth="1.5" strokeLinecap="round" />
                <ellipse cx="171" cy="210" rx="6" ry="5" fill="#3D8060" />
                <circle cx="168" cy="207" r="2.5" fill="#F472B6" opacity="0.9" />
                <circle cx="174" cy="206" r="2" fill="#FB7185" opacity="0.85" />

                {/* ══════════════════════════════ */}
                {/* ── House (floating + breathing) ── */}
                {/* ══════════════════════════════ */}
                <g className="es-house">
                    <g className="es-house-body">
                        {/* Chimney */}
                        <rect x="168" y="90" width="14" height="26" rx="3" fill="#D8CEBC" stroke="#153730" strokeWidth="2" />
                        <rect x="164" y="88" width="22" height="8" rx="3" fill="#E0D6C4" stroke="#153730" strokeWidth="2" />

                        {/* Chimney smoke */}
                        <circle className="es-smoke1" cx="175" cy="85" r="5" fill="#E8E2D8" opacity="0.6" />
                        <circle className="es-smoke2" cx="175" cy="83" r="4" fill="#EDE8E0" opacity="0.5" />

                        {/* Roof */}
                        <path d="M118 130 L200 72 L282 130" fill="#153730" stroke="#153730" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M145 115 L200 78 L255 115" fill="#1F4B3F" opacity="0.5" />
                        <path d="M115 133 L200 74 L285 133" fill="none" stroke="#0F2A24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                        {/* Walls */}
                        <rect x="130" y="128" width="140" height="100" rx="10" fill="#FAF7EF" stroke="#153730" strokeWidth="3" />
                        {/* Side shadow */}
                        <rect x="250" y="128" width="20" height="100" rx="0" fill="#153730" opacity="0.06" />

                        {/* Door */}
                        <rect x="178" y="175" width="44" height="55" rx="7" fill="#F0A93A" stroke="#153730" strokeWidth="2.5" />
                        <path d="M178 182 Q200 165 222 182" fill="#FADA7A" stroke="#153730" strokeWidth="2" />
                        <circle cx="218" cy="205" r="3.5" fill="#153730" />

                        {/* Left window */}
                        <rect x="140" y="148" width="36" height="30" rx="6" fill="#D6EDF5" stroke="#153730" strokeWidth="2.5" />
                        <line x1="158" y1="148" x2="158" y2="178" stroke="#153730" strokeWidth="1.5" />
                        <line x1="140" y1="163" x2="176" y2="163" stroke="#153730" strokeWidth="1.5" />
                        <path d="M144 152 L152 152 L148 160 Z" fill="white" opacity="0.4" />

                        {/* Right window */}
                        <rect x="224" y="148" width="36" height="30" rx="6" fill="#D6EDF5" stroke="#153730" strokeWidth="2.5" />
                        <line x1="242" y1="148" x2="242" y2="178" stroke="#153730" strokeWidth="1.5" />
                        <line x1="224" y1="163" x2="260" y2="163" stroke="#153730" strokeWidth="1.5" />
                        <path d="M228 152 L236 152 L232 160 Z" fill="white" opacity="0.4" />

                        {/* House "eyes" — personality circles above door */}
                        <circle cx="188" cy="144" r="3.5" fill="#D6EDF5" stroke="#153730" strokeWidth="1.5" />
                        <circle cx="212" cy="144" r="3.5" fill="#D6EDF5" stroke="#153730" strokeWidth="1.5" />
                    </g>
                </g>

                {/* ══════════════════════════════ */}
                {/* ── Magnifying glass (scanning) ── */}
                {/* ══════════════════════════════ */}
                <g className="es-mag">
                    <circle cx="155" cy="145" r="42" fill="#FFFDF8" fillOpacity="0.78" stroke="#D98F1E" strokeWidth="6" />
                    <circle cx="155" cy="145" r="35" fill="#FEFCF5" fillOpacity="0.45" />
                    <path d="M138 128 Q145 124 152 130" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                    <circle cx="145" cy="135" r="4" fill="white" opacity="0.35" />
                    <line x1="127" y1="173" x2="98" y2="202" stroke="#153730" strokeWidth="8" strokeLinecap="round" />
                    <line x1="121" y1="179" x2="116" y2="184" stroke="#1F4B3F" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                    <line x1="115" y1="185" x2="110" y2="190" stroke="#1F4B3F" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                    <path d="M148 137 L152 141 M159 137 L163 141" stroke="#D98F1E" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                    <path d="M148 144 L150 142 L152 144 L154 142 L156 144" stroke="#F0A93A" strokeWidth="1.5" strokeLinecap="round" />
                </g>

                {/* ── Location pin (bouncing) ── */}
                <g className="es-pin">
                    <path
                        d="M200 58 C189 58 181 66 181 76 C181 90 200 105 200 105 C200 105 219 90 219 76 C219 66 211 58 200 58 Z"
                        fill="#C86B3A"
                        stroke="#153730"
                        strokeWidth="2.5"
                    />
                    <circle cx="200" cy="76" r="7" fill="white" opacity="0.85" />
                </g>

                {/* ── Question marks ── */}
                <g className="es-q1">
                    <text x="338" y="128" fill="#D98F1E" fontSize="20" fontWeight="800" fontFamily="Georgia, serif" opacity="0.8">?</text>
                </g>
                <g className="es-q2">
                    <text x="52" y="148" fill="#2D6A5A" fontSize="16" fontWeight="800" fontFamily="Georgia, serif" opacity="0.7">?</text>
                </g>
                <g className="es-q3">
                    <text x="350" y="170" fill="#C86B3A" fontSize="14" fontWeight="800" fontFamily="Georgia, serif" opacity="0.65">?</text>
                </g>

                {/* ── Sparkles ── */}
                <g className="es-sp1">
                    <path d="M318 78 L320 73 L322 78 L327 80 L322 82 L320 87 L318 82 L313 80 Z" fill="#F0A93A" opacity="0.9" />
                </g>
                <g className="es-sp2">
                    <path d="M67 72 L68.5 68 L70 72 L74 73.5 L70 75 L68.5 79 L67 75 L63 73.5 Z" fill="#D98F1E" opacity="0.8" />
                </g>
                <g className="es-sp3">
                    <path d="M352 58 L353.5 54 L355 58 L359 59.5 L355 61 L353.5 65 L352 61 L348 59.5 Z" fill="#C86B3A" opacity="0.75" />
                </g>
                <g className="es-sp4">
                    <path d="M45 108 L46 105 L47 108 L50 109 L47 110 L46 113 L45 110 L42 109 Z" fill="#2D6A5A" opacity="0.7" />
                </g>
                <circle className="es-sp2" cx="290" cy="68" r="3" fill="#FADA7A" opacity="0.8" />
                <circle className="es-sp3" cx="110" cy="90" r="2.5" fill="#F0A93A" opacity="0.7" />
                <circle className="es-sp1" cx="368" cy="100" r="2" fill="#D98F1E" opacity="0.65" />
            </svg>

            {/* ── Text & CTA ── */}
            <h3 className="font-display text-2xl font-extrabold text-forest-deep mb-2">
                {title}
            </h3>
            <p className="font-body text-sm text-muted max-w-md mb-6">
                {description}
            </p>
            <button
                onClick={onReset}
                className="rounded-2xl bg-forest-deep px-6 py-3 font-display font-bold text-white shadow-md hover:bg-forest hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                {actionLabel}
            </button>
        </div>
    );
}