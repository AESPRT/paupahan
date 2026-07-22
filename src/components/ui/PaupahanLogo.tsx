interface PaupahanLogoProps {
  className?: string;
  size?: number;
}

export function PaupahanLogo({ className = "", size = 34 }: PaupahanLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`-rotate-3 transition-transform hover:rotate-0 ${className}`}
    >
      <rect width="512" height="512" rx="120" fill="#153730" />
      <path
        d="M 256 100 L 400 216 H 112 Z"
        fill="#E15B4E"
        stroke="#E15B4E"
        strokeWidth="28"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text
        x="256"
        y="385"
        fontFamily="monospace, sans-serif"
        fontWeight="900"
        fontSize="250"
        fill="#F0A93A"
        textAnchor="middle"
      >
        P
      </text>
      <circle cx="390" cy="390" r="56" fill="#F0A93A" stroke="#153730" strokeWidth="8" />
      <path
        d="M368 390 L384 406 L414 374"
        stroke="#153730"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
