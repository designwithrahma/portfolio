import { useRef, useState, useEffect } from "react";
import { Play, RotateCcw, Trophy, Gamepad2 } from "lucide-react";
import { uiSound } from "@/utils/sound";

export function ArcadeWindow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("rahma-arcade-highscore") || "0", 10);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);

  const gameStateRef = useRef({
    playerY: 220,
    playerVy: 0,
    isJumping: false,
    obstacles: [] as { x: number; w: number; h: number; type: "ground" | "air" }[],
    speed: 5,
    score: 0,
    inverted: false,
  });

  const jump = () => {
    const s = gameStateRef.current;
    if (!s.isJumping) {
      s.playerVy = -11;
      s.isJumping = true;
      uiSound.play("switch");
    }
  };

  const shiftDimension = () => {
    const s = gameStateRef.current;
    s.inverted = !s.inverted;
    uiSound.play("open");
  };

  const startGame = () => {
    gameStateRef.current = {
      playerY: 220,
      playerVy: 0,
      isJumping: false,
      obstacles: [{ x: 500, w: 24, h: 40, type: "ground" }],
      speed: 5,
      score: 0,
      inverted: false,
    };
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const gravity = 0.65;
    const groundY = 220;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      } else if (e.key === "Shift" || e.code === "KeyX") {
        e.preventDefault();
        shiftDimension();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const loop = () => {
      const s = gameStateRef.current;
      const bg = s.inverted ? "#ffffff" : "#0d0d10";
      const fg = s.inverted ? "#0d0d10" : "#ffffff";

      // Physics
      s.playerVy += gravity;
      s.playerY += s.playerVy;

      if (s.playerY >= groundY) {
        s.playerY = groundY;
        s.playerVy = 0;
        s.isJumping = false;
      }

      // Obstacle management
      s.obstacles.forEach((obs) => {
        obs.x -= s.speed;
      });

      if (s.obstacles.length > 0 && s.obstacles[0].x < -50) {
        s.obstacles.shift();
        s.score += 10;
        setScore(s.score);
        s.speed = Math.min(10, 5 + s.score * 0.02);
      }

      const lastObs = s.obstacles[s.obstacles.length - 1];
      if (!lastObs || lastObs.x < 360 + Math.random() * 100) {
        s.obstacles.push({
          x: 640 + Math.random() * 120,
          w: 24 + Math.random() * 10,
          h: 35 + Math.random() * 25,
          type: Math.random() > 0.6 ? "air" : "ground",
        });
      }

      // Collision Detection
      const playerBox = { x: 70, y: s.playerY, w: 26, h: 26 };
      for (const obs of s.obstacles) {
        const obsY = obs.type === "air" ? groundY - 45 : groundY - obs.h + 26;
        if (
          playerBox.x < obs.x + obs.w &&
          playerBox.x + playerBox.w > obs.x &&
          playerBox.y < obsY + obs.h &&
          playerBox.y + playerBox.h > obsY
        ) {
          // Game Over
          setIsPlaying(false);
          setGameOver(true);
          uiSound.play("close");
          if (s.score > highScore) {
            setHighScore(s.score);
            try {
              localStorage.setItem("rahma-arcade-highscore", s.score.toString());
            } catch {}
          }
          return;
        }
      }

      // Render
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor line
      ctx.strokeStyle = fg;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 26);
      ctx.lineTo(canvas.width, groundY + 26);
      ctx.stroke();

      // Draw Player Cube
      ctx.fillStyle = fg;
      ctx.fillRect(playerBox.x, playerBox.y, playerBox.w, playerBox.h);

      // Draw Obstacles
      s.obstacles.forEach((obs) => {
        const obsY = obs.type === "air" ? groundY - 45 : groundY - obs.h + 26;
        ctx.fillStyle = fg;
        ctx.fillRect(obs.x, obsY, obs.w, obs.h);
      });

      // HUD
      ctx.fillStyle = fg;
      ctx.font = "12px monospace";
      ctx.fillText(`SCORE: ${s.score}`, 16, 28);
      ctx.fillText(`DIMENSION: ${s.inverted ? "LIGHT" : "DARK"}`, canvas.width - 160, 28);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, highScore]);

  return (
    <div className="h-full flex flex-col bg-[#0d0d10] text-white p-4 sm:p-6 overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Gamepad2 size={16} className="text-emerald-400" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold text-white">
            MONO//SHIFT — Mini Arcade
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy size={13} />
            <span>BEST: {highScore}</span>
          </div>
          <span className="text-white/60">SCORE: {score}</span>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative rounded-xl border border-white/15 overflow-hidden bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={320}
          onClick={isPlaying ? jump : undefined}
          className="w-full h-full object-contain cursor-pointer"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-mono tracking-tight text-white">
                {gameOver ? "SYSTEM SHIFT TERMINATED" : "MONO//SHIFT RUNNER"}
              </h3>
              <p className="text-xs text-white/60 font-mono">
                {gameOver ? `Final Score: ${score}` : "Press SPACE to Jump · SHIFT to invert dimension"}
              </p>
            </div>

            <button
              onClick={startGame}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
            >
              {gameOver ? <RotateCcw size={14} /> : <Play size={14} fill="currentColor" />}
              <span>{gameOver ? "Play Again" : "Start Game"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Touch / Mobile Controls */}
      <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-white/40">
        <div className="flex items-center gap-2">
          <button
            onClick={jump}
            disabled={!isPlaying}
            className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 active:bg-white/20 text-white cursor-pointer"
          >
            [SPACE] JUMP
          </button>
          <button
            onClick={shiftDimension}
            disabled={!isPlaying}
            className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 active:bg-white/20 text-white cursor-pointer"
          >
            [SHIFT] INVERT
          </button>
        </div>
        <span className="hidden sm:inline">Built with HTML5 Canvas &amp; WebAudio</span>
      </div>
    </div>
  );
}
