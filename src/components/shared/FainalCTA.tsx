// components/FinalCTA.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Rocket,
  ArrowRight,
  Sparkles,
  Atom,
  Zap,
  Users,
  Award,
  CheckCircle,
  Star,
  Infinity,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main content animation
      gsap.from(contentRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: "backOut(1.7)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Floating particles animation
      gsap.to(".cta-particle", {
        y: "random(-50, 50)",
        x: "random(-50, 50)",
        rotation: "random(-180, 180)",
        duration: "random(8, 15)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random",
        },
      });

      // Orbiting rings animation
      gsap.to(".orbit-ring", {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "linear",
      });

      // Pulsing glow animation
      gsap.to(".glow-pulse", {
        scale: 1.2,
        opacity: 0.5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="orbit-ring absolute inset-0 border border-blue-500/20 rounded-full"
            style={{ animation: "orbit 20s linear infinite" }}
          />
          <div
            className="orbit-ring absolute inset-[15%] border border-purple-500/20 rounded-full"
            style={{ animation: "orbit 15s linear infinite reverse" }}
          />
          <div
            className="orbit-ring absolute inset-[30%] border border-pink-500/20 rounded-full"
            style={{ animation: "orbit 10s linear infinite" }}
          />
        </div>

        {/* Floating particles */}
        <div ref={particlesRef} className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="cta-particle absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
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

      {/* Main content */}
      <div className="container mx-auto px-6 relative z-10">
        <div ref={contentRef} className="max-w-5xl mx-auto">
          {/* Glowing card */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-700 glow-pulse" />

            {/* Main card */}
            <div className="relative bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
              {/* Animated gradient border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient" />

              {/* Content */}
              <div className="relative p-8 md:p-12 lg:p-16 text-center">
                {/* Icon grid */}
                <div className="flex justify-center gap-4 mb-8">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Atom className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                    <Infinity className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <Rocket className="w-6 h-6 text-orange-400" />
                  </div>
                </div>

                {/* Main heading */}
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    Start Learning
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Physics Today
                  </span>
                </h2>

                {/* Description */}
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                  Join thousands of students mastering physics with India's most
                  comprehensive learning platform. Your journey to excellence
                  starts here.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                  <Link
                    href="/courses"
                    className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl font-bold text-white text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Get Started Now
                      <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>

                  <Link
                    href="/free-resources"
                    className="group px-10 py-5 bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-2xl font-bold text-white text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Try Free Resources
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-white/10">
                  {/* Student count */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-gray-900"
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-semibold">
                          10,000+
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Active Students</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <span className="text-white font-semibold">4.9/5</span>
                      <p className="text-xs text-gray-500">Student Rating</p>
                    </div>
                  </div>

                  {/* Guarantee */}
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-400" />
                    <div className="text-left">
                      <span className="text-white font-semibold">
                        7-Day Moneyback
                      </span>
                      <p className="text-xs text-gray-500">Guarantee</p>
                    </div>
                  </div>
                </div>

                {/* Features grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                  {[
                    "Expert Faculty",
                    "Live Classes",
                    "Practice Tests",
                    "Doubt Support",
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-center text-gray-600 mt-8 text-sm">
            No credit card required. Start with our free resources today.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient {
          background: linear-gradient(
            90deg,
            rgba(59, 130, 246, 0.1),
            rgba(139, 92, 246, 0.1),
            rgba(236, 72, 153, 0.1)
          );
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        .orbit-ring {
          animation: orbit 20s linear infinite;
        }
      `}</style>
    </section>
  );
}
