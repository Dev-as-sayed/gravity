// components/Hero.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ArrowRight, Atom, Sparkles, Brain, Zap, Globe } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin);

const formulas = [
  {
    id: "einstein",
    label: "Einstein",
    description: "Mass-energy equivalence",
    icon: "⚛️",
    equation: "E = mc²",
    color: "from-blue-400 to-cyan-400",
    render: () => (
      <div className="formula text-6xl md:text-7xl lg:text-8xl font-bold font-mono">
        <span className="e text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          E
        </span>
        <span className="equals text-white/60 mx-2">=</span>
        <span className="m text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
          m
        </span>
        <span className="c text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          c<span className="square text-3xl align-super">²</span>
        </span>
      </div>
    ),
  },
  {
    id: "newton",
    label: "Newton",
    description: "Second law of motion",
    icon: "⚡",
    equation: "F = ma",
    color: "from-green-400 to-emerald-400",
    render: () => (
      <div className="formula text-6xl md:text-7xl lg:text-8xl font-bold font-mono">
        <span className="f text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
          F
        </span>
        <span className="equals text-white/60 mx-2">=</span>
        <span className="m text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          m
        </span>
        <span className="a text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          a
        </span>
      </div>
    ),
  },
  {
    id: "schrodinger",
    label: "Schrödinger",
    description: "Quantum wave equation",
    icon: "🌀",
    equation: "iħ∂ψ/∂t = Ĥψ",
    color: "from-purple-400 to-pink-400",
    render: () => (
      <div className="formula text-4xl md:text-5xl lg:text-6xl font-bold font-mono flex flex-wrap items-center justify-center gap-2">
        <span className="i text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          i
        </span>
        <span className="hbar text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          ħ
        </span>
        <span className="partial text-white/80">∂/∂t</span>
        <span className="psi text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          ψ
        </span>
        <span className="equals text-white/60 mx-2">=</span>
        <span className="hat text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Ĥ
        </span>
        <span className="psi text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          ψ
        </span>
      </div>
    ),
  },
  {
    id: "heisenberg",
    label: "Heisenberg",
    description: "Uncertainty principle",
    icon: "🔮",
    equation: "Δx Δp ≥ ħ/2",
    color: "from-red-400 to-orange-400",
    render: () => (
      <div className="formula text-5xl md:text-6xl lg:text-7xl font-bold font-mono">
        <span className="dx text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          Δx
        </span>
        <span className="dp text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 ml-2">
          Δp
        </span>
        <span className="equals text-white/60 mx-3">≥</span>
        <span className="hbar text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
          ħ
        </span>
        <span className="division text-white/60 mx-2">/</span>
        <span className="two text-white/80">2</span>
      </div>
    ),
  },
  {
    id: "maxwell",
    label: "Maxwell",
    description: "Electromagnetic wave equation",
    icon: "⚡",
    equation: "∇·E = ρ/ε₀",
    color: "from-yellow-400 to-amber-400",
    render: () => (
      <div className="formula text-5xl md:text-6xl lg:text-7xl font-bold font-mono">
        <span className="nabla text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
          ∇·E
        </span>
        <span className="equals text-white/60 mx-3">=</span>
        <span className="rho text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
          ρ
        </span>
        <span className="division text-white/60 mx-2">/</span>
        <span className="epsilon text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">
          ε₀
        </span>
      </div>
    ),
  },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const formulaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  const [currentFormulaIndex, setCurrentFormulaIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const x = (clientX / innerWidth - 0.5) * 20;
      const y = (clientY / innerHeight - 0.5) * 20;

      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Canvas background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2,
          color: `rgba(59, 130, 246, ${Math.random() * 0.3})`,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)";
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    initParticles();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Rotate formulas with smooth transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFormulaIndex((p) => (p + 1) % formulas.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Advanced formula animation
  useEffect(() => {
    if (!formulaRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // Animate each character with unique effects
      tl.from(".formula span", {
        opacity: 0,
        scale: 0.5,
        rotation: 180,
        stagger: {
          amount: 1,
          from: "random",
        },
        duration: 1.2,
        ease: "backOut(1.7)",
      })
        .to(
          ".formula",
          {
            textShadow: "0 0 30px currentColor",
            duration: 0.8,
            ease: "sine.inOut",
          },
          "-=0.5",
        )
        .to(".formula", {
          textShadow: "0 0 20px currentColor",
          duration: 0.8,
          ease: "sine.inOut",
        });
    }, formulaRef);

    return () => ctx.revert();
  }, [currentFormulaIndex]);

  // Particle animation
  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = particlesRef.current.children;

    gsap.fromTo(
      particles,
      { opacity: 0, scale: 0 },
      {
        opacity: 0.6,
        scale: 1,
        duration: 2,
        stagger: 0.02,
        ease: "power3.out",
      },
    );

    gsap.to(particles, {
      y: "random(-100, 100)",
      x: "random(-100, 100)",
      duration: "random(8, 15)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: {
        amount: 2,
        from: "random",
      },
    });
  }, []);

  // Main title animation
  useEffect(() => {
    if (!textRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".hero-title span", {
        opacity: 0,
        y: 100,
        rotationX: -90,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top 80%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // Parallax effect on scroll
  useEffect(() => {
    if (!heroRef.current) return;

    gsap.to(".parallax-bg", {
      y: 200,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white"
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Parallax background elements */}
      <div className="parallax-bg absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen py-20">
          {/* LEFT CONTENT */}
          <div className="hero-left space-y-8">
            {/* Animated badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm font-medium text-blue-400">
                Where Physics Comes Alive
              </span>
            </div>

            {/* Main title */}
            <h1
              ref={textRef}
              className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="">Master Physics With</span>{" "}
              <span className="">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Gravity
                </span>
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full" />
              </span>
            </h1>

            {/* Description with typing effect */}
            <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
              Experience physics like never before with interactive formulas,
              quantum simulations, and personalized learning paths designed for
              the modern physicist.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/courses"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Learning
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link
                href="/about"
                className="group px-8 py-4 border border-white/20 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center justify-center gap-2"
              >
                <span>Watch Demo</span>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:scale-150 transition-transform" />
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE - FORMULA */}
          <div className="hero-right relative">
            {/* Orbiting elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[200, 300, 400].map((size, i) => (
                <div
                  key={i}
                  className="absolute border border-blue-500/20 rounded-full"
                  style={{
                    width: size,
                    height: size,
                    animation: `orbit ${10 + i * 2}s linear infinite`,
                  }}
                />
              ))}
            </div>

            {/* Floating physics symbols */}
            {["⚛️", "∑", "∫", "∇", "∞", "Ψ", "Ω", "λ"].map((symbol, i) => (
              <div
                key={i}
                className="absolute text-3xl opacity-20 animate-float"
                style={{
                  top: `${20 + i * 10}%`,
                  left: `${10 + i * 15}%`,
                  animation: `float ${6 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                  transform: `translate(${mousePosition.x * (i + 1)}px, ${mousePosition.y * (i + 1)}px)`,
                }}
              >
                {symbol}
              </div>
            ))}

            {/* Formula card */}
            <div
              key={currentFormulaIndex}
              className="relative group"
              style={{
                transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
              }}
            >
              {/* Glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${formulas[currentFormulaIndex].color} opacity-20 blur-3xl group-hover:opacity-30 transition-opacity duration-500`}
              />

              {/* Card */}
              <div
                ref={formulaRef}
                className="relative  rounded-full p-10 text-center shadow-2xl overflow-hidden"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-shimmer" />

                {/* Icon and label */}
                <div className="relative z-10 mb-6">
                  <span className="text-4xl mb-2 block animate-bounce-gentle">
                    {formulas[currentFormulaIndex].icon}
                  </span>
                  <span
                    className={`text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r ${formulas[currentFormulaIndex].color} bg-opacity-20 text-transparent bg-clip-text bg-gradient-to-r ${formulas[currentFormulaIndex].color}`}
                  >
                    {formulas[currentFormulaIndex].label}
                  </span>
                </div>

                {/* Formula */}
                <div className="relative z-10">
                  {formulas[currentFormulaIndex].render()}
                </div>

                {/* Description */}
                <p className="relative z-10 text-gray-400 mt-6 text-sm">
                  {formulas[currentFormulaIndex].description}
                </p>

                {/* Progress indicators */}
                <div className="flex justify-center gap-2 mt-8">
                  {formulas.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFormulaIndex(index)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === currentFormulaIndex
                          ? `w-8 bg-gradient-to-r ${formulas[currentFormulaIndex].color}`
                          : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
