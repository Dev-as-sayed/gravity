// components/FormulaUI.tsx
"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles, RotateCw } from "lucide-react";
import gsap from "gsap";

interface FormulaUIProps {
  formulas: Array<{
    id: string;
    label: string;
    description: string;
    icon: string;
    equation: string;
    color: string;
    gradient: string[];
  }>;
  currentIndex: number;
  onFormulaChange: (index: number) => void;
  autoRotate: boolean;
  onAutoRotateToggle: () => void;
  titleRef: React.RefObject<HTMLHeadingElement>;
  badgeRef: React.RefObject<HTMLDivElement>;
  ctaRef: React.RefObject<HTMLDivElement>;
}

export default function FormulaUI({
  formulas,
  currentIndex,
  onFormulaChange,
  autoRotate,
  onAutoRotateToggle,
  titleRef,
  badgeRef,
  ctaRef,
}: FormulaUIProps) {
  const currentFormula = formulas[currentIndex];
  const descriptionRef = useRef<HTMLDivElement>(null);
  const formulaSelectorRef = useRef<HTMLDivElement>(null);

  // Animate formula selector entrance
  useEffect(() => {
    gsap.from(formulaSelectorRef.current, {
      x: 100,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: "power3.out",
    });
  }, []);

  // Animate description when formula changes
  useEffect(() => {
    if (descriptionRef.current) {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
      );
    }
  }, [currentIndex]);

  // Animate active button highlight
  const handleButtonClick = (index: number) => {
    const button = document.getElementById(`formula-btn-${index}`);
    if (button) {
      gsap.to(button, {
        scale: 0.98,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => onFormulaChange(index),
      });
    } else {
      onFormulaChange(index);
    }
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Main content overlay */}
      <div className="container mx-auto px-6 lg:px-8 h-full flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* LEFT CONTENT */}
          <div className="space-y-8 pointer-events-auto">
            {/* Animated badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-blue-400">
                Where Physics Comes Alive
              </span>
            </div>

            {/* Main title */}
            <h1
              ref={titleRef}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="block">Master Physics With</span>
              <span className="relative inline-block mt-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Gravity
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full" />
              </span>
            </h1>

            {/* Dynamic formula description */}
            <div ref={descriptionRef} className="formula-description space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentFormula.icon}</span>
                <h2 className="text-2xl font-semibold text-white">
                  {currentFormula.label}
                </h2>
              </div>
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                {currentFormula.description}
              </p>
              <div className="inline-block px-4 py-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <code className="text-xl font-mono text-blue-300">
                  {currentFormula.equation}
                </code>
              </div>
            </div>

            {/* CTA Buttons */}
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row gap-4 pt-4 pointer-events-auto"
            >
              <a
                href="/courses"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Learning
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </a>

              <button className="group px-8 py-4 border border-white/20 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-2">
                <span>Watch Demo</span>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:scale-150 transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT - Formula Selector */}
          <div ref={formulaSelectorRef} className="pointer-events-auto">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Physics Formulas
                </h3>
                <button
                  onClick={onAutoRotateToggle}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    autoRotate
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-white/5 text-gray-400 border border-white/10"
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {formulas.map((formula, idx) => (
                  <button
                    key={formula.id}
                    id={`formula-btn-${idx}`}
                    onClick={() => handleButtonClick(idx)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                      idx === currentIndex
                        ? `bg-gradient-to-r ${getGradientClass(formula.gradient)} bg-opacity-20 border border-white/20 shadow-lg`
                        : "bg-white/5 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{formula.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          {formula.label}
                        </div>
                        <div className="text-sm text-gray-400 font-mono">
                          {formula.equation}
                        </div>
                      </div>
                      {idx === currentIndex && (
                        <div
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${getGradientClass(formula.gradient)} animate-pulse`}
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Instruction hint */}
              <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-500">
                <span>🖱️ Drag to rotate • Scroll to zoom</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom progress indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        {formulas.map((_, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? `w-8 bg-gradient-to-r ${getGradientClass(formulas[currentIndex].gradient)}`
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function getGradientClass(gradients: string[]) {
  const colorMap: Record<string, string> = {
    "#3b82f6": "from-blue-400",
    "#06b6d4": "to-cyan-400",
    "#10b981": "from-green-400",
    "#34d399": "to-emerald-400",
    "#a855f7": "from-purple-400",
    "#d946ef": "to-pink-400",
    "#ef4444": "from-red-400",
    "#f97316": "to-orange-400",
    "#fbbf24": "from-yellow-400",
    "#f59e0b": "to-amber-400",
  };

  const fromColor = colorMap[gradients[0]] || "from-blue-400";
  const toColor = colorMap[gradients[1]] || "to-purple-400";

  return `${fromColor} ${toColor}`;
}
