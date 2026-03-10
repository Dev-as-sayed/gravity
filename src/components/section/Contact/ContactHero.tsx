// components/ContentHero.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  Newspaper,
  ChevronRight,
  Sparkles,
  Atom,
  Zap,
  Brain,
  Infinity,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface ContentHeroProps {
  title: string;
  highlightedText?: string;
  description: string;
  category: "notes" | "blog" | "media" | "general";
  breadcrumb?: {
    label: string;
    href: string;
  }[];
  cta?: {
    primary?: {
      text: string;
      href: string;
    };
    secondary?: {
      text: string;
      href: string;
    };
  };
  stats?: {
    value: string;
    label: string;
  }[];
}

const categoryConfig = {
  notes: {
    icon: FileText,
    color: "from-green-400 to-blue-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    textColor: "text-green-400",
    gradient: "from-green-400 via-blue-400 to-purple-400",
  },
  blog: {
    icon: Newspaper,
    color: "from-purple-400 to-pink-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    textColor: "text-purple-400",
    gradient: "from-purple-400 via-pink-400 to-rose-400",
  },
  media: {
    icon: Video,
    color: "from-orange-400 to-red-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    textColor: "text-orange-400",
    gradient: "from-orange-400 via-red-400 to-rose-400",
  },
  general: {
    icon: Atom,
    color: "from-blue-400 to-cyan-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-400",
    gradient: "from-blue-400 via-cyan-400 to-purple-400",
  },
};

// Fixed component name from ContactHero to ContentHero
export default function ContactHero({
  title,
  highlightedText,
  description,
  category = "general",
}: ContentHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const config = categoryConfig[category];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main content animation
      gsap.from(contentRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      // Floating particles animation
      gsap.to(".hero-particle", {
        y: "random(-50, 50)",
        x: "random(-50, 50)",
        duration: "random(8, 15)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random",
        },
      });

      // Animated background gradient
      gsap.to(".gradient-orb", {
        scale: 1.2,
        opacity: 0.3,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const Icon = config.icon;

  return (
    <section
      ref={heroRef}
      className="relative min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="gradient-orb absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="gradient-orb absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Floating particles */}
        <div ref={particlesRef} className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`hero-particle absolute w-1 h-1 ${config.textColor} rounded-full opacity-20`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div ref={contentRef} className="max-w-4xl mx-auto text-center">
          {/* Category Badge */}
          <div
            className={`inline-flex items-center gap-2 ${config.bgColor} border ${config.borderColor} rounded-full px-4 py-2 mb-8 backdrop-blur-sm`}
          >
            <Icon className={`w-4 h-4 ${config.textColor}`} />
            <span className={`text-sm font-medium ${config.textColor}`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>

          {/* Main Title - Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {title}{" "}
            </span>
            {highlightedText && (
              <span
                className={`text-transparent bg-clip-text bg-gradient-to-r ${config.gradient}`}
              >
                {highlightedText}
              </span>
            )}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </section>
  );
}
