"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase =
  | "dark"        // 0–300ms  : pure black
  | "grid"        // 300–700ms: grid + scanlines fade in
  | "hud"         // 700–1100ms: corners, HUD lines, labels
  | "title"       // 1100–1700ms: letter-by-letter HKS STUDIO
  | "loader"      // 1700–2500ms: segmented bar + logs
  | "flash"       // 2500–2800ms: signature scan-flash moment
  | "exit";       // 2800ms+  : wipe-out

// ─── Constants ───────────────────────────────────────────────────────────────

const TITLE = "HKS STUDIO";
const LETTERS = TITLE.split("");

const BOOT_LOGS = [
  "AUTHENTICATING...",
  "LOADING MODULES...",
  "CALIBRATING SYSTEM...",
  "VERIFYING OPERATOR...",
  "ACCESS GRANTED",
];

const PHASE_DELAYS: Record<Phase, number> = {
  dark:   0,
  grid:   300,
  hud:    700,
  title:  1050,
  loader: 1700,
  flash:  2450,
  exit:   2800,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function usePhase(onExit: () => void) {
  const [phase, setPhase] = useState<Phase>("dark");

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];

    (["grid", "hud", "title", "loader", "flash", "exit"] as Phase[]).forEach((p) => {
      ids.push(setTimeout(() => setPhase(p), PHASE_DELAYS[p]));
    });

    // Notify parent just after phase=exit starts
    ids.push(setTimeout(onExit, PHASE_DELAYS.exit + 80));

    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return phase;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated background grid that fades in */
function GridLayer({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[1]"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{
        backgroundImage:
          "linear-gradient(rgba(250,204,21,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.045) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />
  );
}

/** Scanline sweep — subtle horizontal glow line */
function ScanlineSweep({ visible }: { visible: boolean }) {
  return visible ? (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[2px]"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(250,204,21,0.22) 40%, rgba(250,204,21,0.22) 60%, transparent 100%)",
        animation: "hks-scanline 2.4s linear infinite",
      }}
    />
  ) : null;
}

/** Static film-grain noise */
function NoiseLayer() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[4] opacity-[0.028]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "180px 180px",
      }}
    />
  );
}

/** Radar sweep on the left — SVG arc rotating */
function RadarSweep({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute bottom-16 left-10 z-[6] opacity-30 sm:opacity-40">
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ animation: "hks-radar-spin 3s linear infinite" }}>
        <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(250,204,21,0.18)" strokeWidth="1" />
        <circle cx="36" cy="36" r="20" fill="none" stroke="rgba(250,204,21,0.1)" strokeWidth="1" />
        <circle cx="36" cy="36" r="8"  fill="none" stroke="rgba(250,204,21,0.14)" strokeWidth="1" />
        <line x1="36" y1="36" x2="36" y2="4" stroke="rgba(250,204,21,0.6)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Sweep trail */}
        <path
          d="M36,36 L36,4 A32,32 0 0,1 68,36 Z"
          fill="url(#rsweep)"
        />
        <defs>
          <radialGradient id="rsweep" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor="rgba(250,204,21,0)" />
            <stop offset="100%" stopColor="rgba(250,204,21,0.12)" />
          </radialGradient>
        </defs>
      </svg>
      <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.25em] text-yellow-400/40">RDR</div>
    </div>
  );
}

/** Corner HUD bracket */
function HudCorner({ pos, delay }: { pos: "tl" | "tr" | "bl" | "br"; delay: number }) {
  const isTop = pos.startsWith("t");
  const isLeft = pos.endsWith("l");
  return (
    <motion.div
      className="pointer-events-none absolute z-[10]"
      style={{
        top:    isTop  ? 24 : undefined,
        bottom: !isTop ? 24 : undefined,
        left:   isLeft ? 24 : undefined,
        right:  !isLeft ? 24 : undefined,
        width: 40, height: 40,
        borderTop:    isTop  ? "1.5px solid rgba(250,204,21,0.75)" : undefined,
        borderBottom: !isTop ? "1.5px solid rgba(250,204,21,0.75)" : undefined,
        borderLeft:   isLeft ? "1.5px solid rgba(250,204,21,0.75)" : undefined,
        borderRight:  !isLeft ? "1.5px solid rgba(250,204,21,0.75)" : undefined,
        animation: "hks-hud-ping 2s ease-in-out infinite",
        animationDelay: `${delay}s`,
      }}
      initial={{ opacity: 0, scale: 1.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay }}
    />
  );
}

/** Moving coordinate lines — faint horizontal/vertical data tracers */
function CoordLines({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <>
      {/* Horizontal moving tracer */}
      <div
        className="pointer-events-none absolute left-0 z-[6] h-px w-24 opacity-20"
        style={{
          top: "38%",
          background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.8), transparent)",
          animation: "hks-coord-h 4s ease-in-out infinite",
        }}
      />
      {/* Vertical moving tracer */}
      <div
        className="pointer-events-none absolute top-0 z-[6] h-20 w-px opacity-20"
        style={{
          left: "62%",
          background: "linear-gradient(180deg, transparent, rgba(250,204,21,0.8), transparent)",
          animation: "hks-coord-v 5s ease-in-out 0.5s infinite",
        }}
      />
    </>
  );
}

/** Floating ambient data particles */
function AmbientParticles({ visible }: { visible: boolean }) {
  const particles = [
    { x: "15%", y: "25%", delay: 0 },
    { x: "82%", y: "18%", delay: 0.4 },
    { x: "72%", y: "72%", delay: 0.8 },
    { x: "28%", y: "68%", delay: 0.2 },
    { x: "90%", y: "44%", delay: 0.6 },
    { x: "44%", y: "85%", delay: 1.0 },
  ];
  if (!visible) return null;
  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-[6] h-1 w-1 rounded-full bg-yellow-400"
          style={{
            left: p.x,
            top: p.y,
            opacity: 0,
            animation: `hks-particle-pulse 2.8s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

/** HUD horizontal separator lines */
function HudSeparators({ visible }: { visible: boolean }) {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[60px] z-[10] h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.3) 20%, rgba(250,204,21,0.3) 80%, transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-[60px] z-[10] h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.3) 20%, rgba(250,204,21,0.3) 80%, transparent)" }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: visible ? 1 : 0, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      />
    </>
  );
}

/** HUD metadata labels — top left / right */
function HudLabels({ visible }: { visible: boolean }) {
  return (
    <>
      <motion.div
        className="pointer-events-none absolute left-9 top-[72px] z-[11] font-mono text-[9px] uppercase tracking-[0.35em] text-yellow-400/55"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -6 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        OPR // HKS-001
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-9 top-[72px] z-[11] font-mono text-[9px] uppercase tracking-[0.3em] text-yellow-400/40"
        initial={{ opacity: 0, x: 6 }}
        animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 6 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        SYS.BOOT / 2.1.0
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-9 bottom-[72px] z-[11] text-right font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div>BUILD 2026.05</div>
        <div>STUDIO ENGINE v3</div>
      </motion.div>
    </>
  );
}

/** Signal bars — bottom left */
function SignalBars({ visible, progress }: { visible: boolean; progress: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-[72px] left-9 z-[11] flex items-end gap-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      {[4, 6, 8, 11, 14].map((h, i) => (
        <div
          key={h}
          style={{
            width: 3, height: h,
            background: progress > i * 20 ? "#facc15" : "rgba(113,113,122,0.35)",
            transition: "background 0.35s",
          }}
        />
      ))}
      <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">SIG</span>
    </motion.div>
  );
}

/** Letter-by-letter animated title */
function TitleReveal({ phase }: { phase: Phase }) {
  const phases: Phase[] = ["dark", "grid", "hud", "title", "loader", "flash", "exit"];
  const idx = phases.indexOf(phase);
  const titleActive = idx >= phases.indexOf("title");
  const [glitchReady, setGlitchReady] = useState(false);

  useEffect(() => {
    if (titleActive) {
      const t = setTimeout(() => setGlitchReady(true), 700);
      return () => clearTimeout(t);
    }
  }, [titleActive]);

  return (
    <div className="relative select-none">
      {/* Chromatic layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex justify-center font-mono text-4xl font-black uppercase tracking-[0.55em] text-red-400 sm:text-5xl"
        style={{ animation: glitchReady ? "hks-glitch-r 3.4s step-end infinite 0.15s" : "none", opacity: 0 }}
      >
        {TITLE}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex justify-center font-mono text-4xl font-black uppercase tracking-[0.55em] text-blue-400 sm:text-5xl"
        style={{ animation: glitchReady ? "hks-glitch-b 3.4s step-end infinite 0.15s" : "none", opacity: 0 }}
      >
        {TITLE}
      </div>

      {/* Primary title — letter-by-letter */}
      <h1
        className="relative flex justify-center gap-0 font-mono text-4xl font-black uppercase sm:text-5xl"
        style={{
          letterSpacing: "0.55em",
          textShadow: "0 0 28px rgba(250,204,21,0.12)",
          animation: glitchReady ? "hks-glitch-x 3.4s step-end infinite" : "none",
        }}
      >
        {LETTERS.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={
              titleActive
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 14, filter: "blur(8px)" }
            }
            transition={{
              duration: 0.38,
              delay: i * 0.055,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ color: char === " " ? "transparent" : "#ffffff" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </h1>

      {/* Underline reveal */}
      <motion.div
        className="mx-auto mt-3 h-[2px] origin-left bg-yellow-400"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: titleActive ? 1 : 0 }}
        transition={{ duration: 0.55, delay: LETTERS.length * 0.055 + 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%" }}
      />
    </div>
  );
}

/** Subtitle line */
function Subtitle({ visible }: { visible: boolean }) {
  return (
    <motion.p
      className="font-mono text-[10px] uppercase tracking-[0.42em] text-zinc-500"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 6 }}
      transition={{ duration: 0.45, delay: 0.35, ease: "easeOut" }}
    >
      Advanced System — Initializing Operator Environment
    </motion.p>
  );
}

/** Segmented tactical progress bar */
function TacticalLoader({ visible, progress, logs }: { visible: boolean; progress: number; logs: string[] }) {
  const SEGMENTS = 20;

  return (
    <motion.div
      className="w-full max-w-sm sm:max-w-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header row */}
      <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.3em]">
        <span className="text-zinc-600">SYSTEM LOAD</span>
        <motion.span
          className="tabular-nums text-yellow-400"
          key={progress}
        >
          {String(progress).padStart(3, "\u2007")}%
        </motion.span>
      </div>

      {/* Segmented bar */}
      <div className="relative flex gap-[2px]">
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const threshold = ((i + 1) / SEGMENTS) * 100;
          const filled = progress >= threshold;
          const active = progress >= threshold - 100 / SEGMENTS && progress < threshold;
          return (
            <div
              key={i}
              className="h-[5px] flex-1 transition-all duration-100"
              style={{
                background: filled
                  ? "#facc15"
                  : active
                  ? "rgba(250,204,21,0.5)"
                  : "rgba(63,63,70,0.5)",
                boxShadow: filled ? "0 0 6px rgba(250,204,21,0.4)" : "none",
              }}
            />
          );
        })}
        {/* Pulse glow at edge */}
        <div
          className="pointer-events-none absolute top-1/2 h-8 w-4 -translate-y-1/2"
          style={{
            left: `calc(${progress}% - 8px)`,
            background: "radial-gradient(ellipse at center, rgba(250,204,21,0.55) 0%, transparent 70%)",
            transition: "left 0.1s linear",
          }}
        />
      </div>

      {/* Tick marks */}
      <div className="mt-1 flex justify-between px-[1px]">
        {[0, 25, 50, 75, 100].map((t) => (
          <div
            key={t}
            style={{
              width: 1, height: 4,
              background: progress >= t ? "rgba(250,204,21,0.55)" : "rgba(63,63,70,0.4)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Live system logs */}
      <div className="mt-4 space-y-[3px] text-left">
        {logs.map((log, i) => (
          <motion.div
            key={log}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em]"
          >
            <span
              style={{
                color: i === logs.length - 1 ? "#facc15" : "rgba(113,113,122,0.6)",
                opacity: i === logs.length - 1 ? 0.7 : 0.5,
              }}
            >
              {">"}
            </span>
            <span style={{ color: i === logs.length - 1 ? "#facc15" : "rgba(113,113,122,0.7)" }}>
              {log}
            </span>
            {i === logs.length - 1 && (
              <span
                className="ml-0.5 inline-block h-2.5 w-[5px] bg-yellow-400"
                style={{ animation: "hks-blink 0.85s step-end infinite" }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Classified tag */}
      <motion.div
        className="mt-4 text-center font-mono text-[8px] uppercase tracking-[0.4em] text-zinc-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        ◈ Classified — Authorized Access Only ◈
      </motion.div>
    </motion.div>
  );
}

/** Signature cinematic scan-flash moment */
function ScanFlash({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          {/* White horizontal flash line */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 z-[50] h-[3px]"
            style={{
              top: "50%",
              background: "linear-gradient(90deg, transparent, rgba(250,204,21,0.9) 20%, white 50%, rgba(250,204,21,0.9) 80%, transparent)",
              boxShadow: "0 0 40px 8px rgba(250,204,21,0.5), 0 0 80px 20px rgba(250,204,21,0.15)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.32, ease: "easeInOut", times: [0, 0.3, 0.7, 1] }}
          />
          {/* Screen overlay flash */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-[49]"
            style={{ background: "rgba(250,204,21,0.04)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
          {/* ACCESS CONFIRMED overlay */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-[50] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.32, times: [0, 0.2, 0.7, 1] }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.6em] text-yellow-400">
              ◈ ACCESS CONFIRMED ◈
            </span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const phase = usePhase(onDone);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phases: Phase[] = ["dark", "grid", "hud", "title", "loader", "flash", "exit"];
  const phaseIdx = (p: Phase) => phases.indexOf(p);
  const after = (p: Phase) => phaseIdx(phase) >= phaseIdx(p);

  // Progress + logs only start in "loader" phase
  useEffect(() => {
    if (phase !== "loader") return;

    let p = 0;
    tickRef.current = setInterval(() => {
      const step = Math.floor(Math.random() * 5) + 2;
      p = Math.min(p + step, 100);
      setProgress(p);
      if (p >= 100 && tickRef.current) clearInterval(tickRef.current);
    }, 22);

    BOOT_LOGS.forEach((line, i) => {
      setTimeout(() => setLogs((prev) => [...prev, line]), i * 150);
    });

    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase]);

  // Wipe exit animation
  const isExiting = phase === "exit";

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-black"
      style={{ pointerEvents: "auto" }}
      exit={{
        clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
        transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
      }}
    >
      {/* ── Layer 1: Grid ── */}
      <GridLayer visible={after("grid")} />

      {/* ── Layer 2: Noise grain ── */}
      <NoiseLayer />

      {/* ── Layer 3: Scanline sweep ── */}
      <ScanlineSweep visible={after("grid")} />

      {/* ── Layer 4: Coordinate tracers + particles ── */}
      <CoordLines visible={after("hud")} />
      <AmbientParticles visible={after("hud")} />

      {/* ── Layer 5: Radar sweep ── */}
      <RadarSweep visible={after("hud")} />

      {/* ── Layer 6: HUD frame ── */}
      <HudSeparators visible={after("hud")} />
      {(["tl", "tr", "bl", "br"] as const).map((pos, i) => (
        <HudCorner key={pos} pos={pos} delay={after("hud") ? 0.05 + i * 0.07 : 999} />
      ))}
      <HudLabels visible={after("hud")} />

      {/* ── Layer 7: Signal bars ── */}
      <SignalBars visible={after("hud")} progress={progress} />

      {/* ── Layer 8: Central content ── */}
      <div className="relative z-[20] flex flex-col items-center gap-7 px-6 text-center">
        <TitleReveal phase={phase} />
        <Subtitle visible={after("title")} />
        {after("loader") && (
          <TacticalLoader visible={after("loader")} progress={progress} logs={logs} />
        )}
      </div>

      {/* ── Layer 9: Signature scan-flash ── */}
      <ScanFlash active={phase === "flash"} />

      {/* ── Layer 10: Exit vignette ── */}
      {isExiting && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[55] bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}
