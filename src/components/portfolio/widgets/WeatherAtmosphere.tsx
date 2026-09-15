import { useEffect, useRef } from "react";

export type WeatherMode = "clear" | "rain" | "mist" | "aurora";

interface Props {
  weather: WeatherMode;
}

export function WeatherAtmosphere({ weather }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (weather === "clear") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number | null = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    /**
     * Pause the particle loop on hidden tabs instead of burning CPU.
     * On hide we cancel the pending frame and null the handle; on show we
     * start exactly one loop. Because `render` always re-schedules, the loop
     * resumes cleanly and can never be left frozen or duplicated.
     */
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (animId !== null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      } else if (animId === null) {
        animId = requestAnimationFrame(render);
      }
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    // Particle setup
    const count = weather === "rain" ? 140 : 60;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: weather === "rain" ? 12 + Math.random() * 8 : 0.2 + Math.random() * 0.4,
      speedX: weather === "rain" ? -1.5 : (Math.random() - 0.5) * 0.3,
      size: weather === "rain" ? 1.5 : 2 + Math.random() * 4,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (weather === "rain") {
        ctx.strokeStyle = "rgba(200, 225, 255, 0.35)";
        ctx.lineWidth = 1;
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.speedY * 1.5);
          ctx.stroke();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        });
      } else if (weather === "mist" || weather === "aurora") {
        particles.forEach((p) => {
          ctx.fillStyle =
            weather === "aurora"
              ? `rgba(110, 231, 183, ${p.opacity * 0.5})`
              : `rgba(255, 255, 255, ${p.opacity * 0.35})`;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.speedX;
          p.y += p.speedY;

          if (p.y > height) p.y = -10;
          if (p.x > width) p.x = 0;
          if (p.x < 0) p.x = width;
        });
      }

      /* Always schedule; the visibility handler cancels while hidden. */
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      animId = null;
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [weather]);

  if (weather === "clear") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[15]"
      aria-hidden
    />
  );
}
