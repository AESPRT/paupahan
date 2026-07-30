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
      className={className}
    >
      {/* Container Background */}
      <rect width="512" height="512" rx="120" fill="#153730" />

      {/* Rounded Roof Triangle */}
      <path
        d="M 233.6 114.2 C 246.4 103.8 265.6 103.8 278.4 114.2 L 393.6 208 C 408 219.7 399.7 242 381.2 242 H 130.8 C 112.3 242 104 219.7 118.4 208 L 233.6 114.2 Z"
        fill="#E15B4E"
      />

      {/* Playful & Bubbly Letter 'P' */}
      <path
        d="M175 250 H242 C275.3 250 300 274.7 300 308 C300 341.3 275.3 366 242 366 H215 V420 C215 431 206 440 195 440 C184 440 175 431 175 420 V250 Z M215 290 V326 H242 C251.9 326 260 317.9 260 308 C260 298.1 251.9 290 242 290 H215 Z"
        fill="#F0A93A"
      />

      {/* Verified Badge Circle */}
      <circle cx="390" cy="390" r="56" fill="#F0A93A" stroke="#153730" strokeWidth="8" />

      {/* Checkmark inside Badge */}
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