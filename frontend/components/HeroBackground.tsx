"use client";

import { useEffect, useRef } from "react";

/* ─── Particle canvas ──────────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 80;
    const GREEN = "89,225,132";

    type Dot = {
      x: number; y: number;
      vx: number; vy: number;
      r: number; alpha: number;
    };

    const dots: Dot[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.5 + 0.15,
    }));

    const LINK_DIST = 140;
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // move
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      });

      // links
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const opacity = (1 - dist / LINK_DIST) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${GREEN},${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      // dots
      dots.forEach((d) => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN},${d.alpha})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

/* ─── Aurora blobs ─────────────────────────────────────────────────── */
function AuroraBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Large top-left green orb */}
      <div
        className="aurora-blob"
        style={{
          width: "55vw",
          height: "55vw",
          top: "-18vw",
          left: "-18vw",
          background: "radial-gradient(circle, rgba(89,225,132,0.13) 0%, transparent 70%)",
          animationDelay: "0s",
          animationDuration: "14s",
        }}
      />
      {/* Mid-right dim orb */}
      <div
        className="aurora-blob"
        style={{
          width: "45vw",
          height: "45vw",
          top: "10vh",
          right: "-12vw",
          background: "radial-gradient(circle, rgba(89,225,132,0.07) 0%, transparent 70%)",
          animationDelay: "-5s",
          animationDuration: "18s",
        }}
      />
      {/* Bottom-centre subtle orb */}
      <div
        className="aurora-blob"
        style={{
          width: "60vw",
          height: "30vw",
          bottom: "-5vw",
          left: "20vw",
          background: "radial-gradient(ellipse, rgba(89,225,132,0.05) 0%, transparent 70%)",
          animationDelay: "-9s",
          animationDuration: "22s",
        }}
      />

      {/* Subtle dot-grid overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(89,225,132,0.18) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          opacity: 0.25,
        }}
      />
    </div>
  );
}

/* ─── Exported wrapper ─────────────────────────────────────────────── */
export default function HeroBackground() {
  return (
    <>
      {/* Keyframes injected once via a style tag */}
      <style>{`
        .aurora-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          animation: auroraDrift linear infinite;
          will-change: transform;
        }
        @keyframes auroraDrift {
          0%   { transform: translate(0, 0) scale(1); }
          25%  { transform: translate(3%, 4%) scale(1.06); }
          50%  { transform: translate(-2%, 6%) scale(0.96); }
          75%  { transform: translate(4%, -3%) scale(1.04); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>
      <AuroraBlobs />
      <ParticleCanvas />
    </>
  );
}
