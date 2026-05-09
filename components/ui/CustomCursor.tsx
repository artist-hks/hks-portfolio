"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    // Raw mouse position — updated instantly on every mousemove
    let mouseX = -100;
    let mouseY = -100;
    // Smoothed position — converges to mouse each RAF tick
    let dotX = -100;
    let dotY = -100;
    // Track last rendered values to skip redundant DOM writes
    let lastTransform = "";
    let lastScale = 1;
    let hovering = false;
    let frameId = 0;

    const el = dotRef.current;
    if (!el) return;

    // Prime the GPU compositing layer once — keeps the cursor on its own layer
    el.style.willChange = "transform";

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Detect hover directly in mousemove — avoids a separate mouseover listener
      const target = e.target instanceof Element ? e.target : null;
      hovering = !!target?.closest("a, button, [data-cursor-hover]");
    };

    const animate = () => {
      // High lerp factor (0.65) = near-instant tracking with just enough smoothing
      // to remove jitter. Far less lag than the previous 0.2 value.
      dotX += (mouseX - dotX) * 0.65;
      dotY += (mouseY - dotY) * 0.65;

      const scale = hovering ? 1.45 : 1;

      // Only write to the DOM when the transform string actually changes —
      // avoids forcing a style-recalc + paint on every frame while stationary.
      const transform = `translate3d(${dotX.toFixed(2)}px, ${dotY.toFixed(2)}px, 0) translate(-50%, -50%) scale(${scale})`;
      if (transform !== lastTransform || scale !== lastScale) {
        el.style.transform = transform;
        lastTransform = transform;
        lastScale = scale;
      }

      frameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-2 w-2 rounded-full bg-yellow-400 opacity-90 shadow-[0_0_0_1px_rgba(10,10,10,0.75)] md:block"
    />
  );
}
