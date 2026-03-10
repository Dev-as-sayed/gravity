"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function EinsteinEquation() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".e", {
        opacity: 0,
        y: -80,
        duration: 0.8,
      })
        .from(
          ".equals",
          {
            opacity: 0,
            x: -40,
            duration: 0.6,
          },
          "-=0.3",
        )
        .from(
          ".m",
          {
            opacity: 0,
            y: 80,
            duration: 0.8,
          },
          "-=0.2",
        )
        .from(
          ".c",
          {
            opacity: 0,
            scale: 0,
            duration: 0.7,
          },
          "-=0.2",
        )
        .from(
          ".square",
          {
            opacity: 0,
            y: -20,
            duration: 0.5,
          },
          "-=0.3",
        )
        .to(".formula", {
          textShadow: "0px 0px 20px #3b82f6",
          duration: 0.8,
        });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={container}
      className="flex items-center justify-center h-screen bg-black text-white"
    >
      <div className="formula text-7xl font-bold flex items-end gap-4">
        <span className="e text-blue-400">E</span>
        <span className="equals">=</span>
        <span className="m text-green-400">m</span>
        <span className="c text-red-400">
          c<span className="square text-3xl align-super">2</span>
        </span>
      </div>
    </div>
  );
}
