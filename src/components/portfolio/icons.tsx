/**
 * Custom brand + OS icons (SVG). Kept hand-built so the dock
 * doesn't depend on deprecated brand exports from icon packs.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
});

export function IconInstagram({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} stroke="currentColor" strokeWidth={1.7} {...props}>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconX({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path
        fill="currentColor"
        d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3Z"
      />
    </svg>
  );
}

export function IconGitHub({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path
        fill="currentColor"
        d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.64 1.66.23 2.88.11 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.23v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .3Z"
      />
    </svg>
  );
}

export function IconLinkedIn({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
      />
    </svg>
  );
}

/** Behance — the brand mark is literally “Bē”, so we render it typographically */
export function IconBehance({ size = 18, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <text
        x="12"
        y="16.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="15"
        fontWeight="700"
        fontFamily="var(--font-sans), system-ui, sans-serif"
        letterSpacing="-0.5"
      >
        Bē
      </text>
    </svg>
  );
}

export const SOCIAL_ICONS = {
  instagram: IconInstagram,
  x: IconX,
  behance: IconBehance,
  github: IconGitHub,
  linkedin: IconLinkedIn,
} as const;
