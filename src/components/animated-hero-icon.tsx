'use client';
import { MortarAndPestle } from '@/components/ui/icons';

const AnimatedHeroIcon = () => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <circle cx="100" cy="100" r="100" fill="url(#glow)" className="animate-pulse-glow" />

      {/* Orbit 1 (fast, solid) */}
      <g style={{ transformOrigin: '100px 100px' }} className="animate-orbit-fast">
        <ellipse
          cx="100"
          cy="100"
          rx="85"
          ry="35"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="0.5"
          opacity="0.7"
        />
        <circle cx="185" cy="100" r="4" fill="hsl(var(--primary))" />
      </g>

      {/* Orbit 2 (medium, dashed) */}
      <g style={{ transformOrigin: '100px 100px' }} className="animate-orbit-medium">
        <ellipse
          cx="100"
          cy="100"
          rx="60"
          ry="80"
          transform="rotate(60 100 100)"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="0.5"
          strokeDasharray="3 5"
          opacity="0.8"
        />
        <circle cx="100" cy="20" r="4" fill="hsl(var(--accent))" transform="rotate(60 100 100)" />
      </g>
        
      {/* Orbit 3 (slow, dotted) */}
      <g style={{ transformOrigin: '100px 100px' }} className="animate-orbit-slow">
        <ellipse
          cx="100"
          cy="100"
          rx="70"
          ry="70"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="0.25"
          strokeDasharray="1 6"
          opacity="0.4"
        />
        <circle cx="170" cy="100" r="3" fill="hsl(var(--foreground))" opacity="0.5" />
      </g>

      {/* Central Element */}
      <g className="animate-pulse-glow">
        <circle cx="100" cy="100" r="32" fill="hsl(var(--background))" />
        <MortarAndPestle
          x="78"
          y="78"
          width="44"
          height="44"
          strokeWidth={1.5}
          className="text-primary"
        />
      </g>
    </svg>
  );
};

export default AnimatedHeroIcon;
