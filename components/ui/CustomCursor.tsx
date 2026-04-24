"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let scale = 1;
    let frameId = 0;

    const updateHoverState = (target: EventTarget | null) => {
      const element = target instanceof Element ? target : null;
      scale = element?.closest("a, button") ? 1.45 : 1;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      updateHoverState(event.target);
    };

    const handleMouseOver = (event: MouseEvent) => {
      updateHoverState(event.target);
    };

    const animate = () => {
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;

      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%) scale(${scale})`;
        dotRef.current.style.opacity = scale > 1 ? "1" : "0.9";
      }

      frameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed left-0 top-0 z-[80] hidden h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_0_1px_rgba(10,10,10,0.75)] md:block"
    />
  );
}
