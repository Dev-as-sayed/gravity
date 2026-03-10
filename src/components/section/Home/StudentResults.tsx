// components/StudentResults.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Trophy,
  Award,
  Star,
  TrendingUp,
  ChevronRight,
  Quote,
  Medal,
  Sparkles,
  Target,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Exam results data
const examResults = [
  {
    exam: "JEE Advanced 2024",
    rank: "AIR 42",
    name: "Arjun Mehta",
    score: "98.7%",
    achievement: "Top 0.1% in Physics",
    color: "from-yellow-400 to-orange-400",
  },
  {
    exam: "NEET 2024",
    rank: "AIR 156",
    name: "Priya Sharma",
    score: "715/720",
    achievement: "Perfect Score in Physics",
    color: "from-green-400 to-emerald-400",
  },
  {
    exam: "IIT JAM 2024",
    rank: "AIR 7",
    name: "Rahul Verma",
    score: "92%",
    achievement: "Physics Topper",
    color: "from-blue-400 to-cyan-400",
  },
  {
    exam: "CUET 2024",
    rank: "99.8 Percentile",
    name: "Neha Gupta",
    score: "580/600",
    achievement: "Physics: 198/200",
    color: "from-purple-400 to-pink-400",
  },
  {
    exam: "KVPY 2023",
    rank: "Fellowship",
    name: "Aditya Kumar",
    score: "SA Topper",
    achievement: "Research Grant Recipient",
    color: "from-red-400 to-rose-400",
  },
  {
    exam: "JEE Main 2024",
    rank: "99.96 Percentile",
    name: "Sneha Reddy",
    score: "295/300",
    achievement: "Physics: 99/100",
    color: "from-indigo-400 to-blue-400",
  },
  {
    exam: "JEE Advanced 2024",
    rank: "AIR 42",
    name: "Arjun Mehta",
    score: "98.7%",
    achievement: "Top 0.1% in Physics",
    color: "from-yellow-400 to-orange-400",
  },
  {
    exam: "NEET 2024",
    rank: "AIR 156",
    name: "Priya Sharma",
    score: "715/720",
    achievement: "Perfect Score in Physics",
    color: "from-green-400 to-emerald-400",
  },
  {
    exam: "IIT JAM 2024",
    rank: "AIR 7",
    name: "Rahul Verma",
    score: "92%",
    achievement: "Physics Topper",
    color: "from-blue-400 to-cyan-400",
  },
];

// Success stories data
const successStories = [
  {
    id: 1,
    name: "Ishita Patel",
    exam: "JEE Advanced 2024",
    rank: "AIR 128",
    quote:
      "Gravity's structured approach transformed my physics preparation. The faculty's guidance on quantum mechanics was exceptional.",
    improvement: "From 60% to 98% in 8 months",
    highlight: "Physics: 99/120",
    color: "from-purple-400 to-pink-400",
  },
  {
    id: 2,
    name: "Vikram Singh",
    exam: "NEET 2024",
    rank: "AIR 234",
    quote:
      "The weekly tests and instant doubt resolution helped me master even the toughest concepts in electromagnetism.",
    improvement: "Rank improved by 15,000 positions",
    highlight: "Physics: 176/180",
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: 3,
    name: "Ananya Desai",
    exam: "IIT JAM 2024",
    rank: "AIR 15",
    quote:
      "The advanced problem-solving sessions prepared me exceptionally well for the physics Olympiad.",
    improvement: "AIR 450 to AIR 15 in 1 year",
    highlight: "Selected for INSPIRE Fellowship",
    color: "from-green-400 to-emerald-400",
  },
  {
    id: 4,
    name: "Rohan Khanna",
    exam: "JEE Main 2024",
    rank: "99.9 Percentile",
    quote:
      "The recorded lectures allowed me to learn at my own pace, and live doubt sessions clarified every concept.",
    improvement: "From 85% to 99.9%ile in 6 months",
    highlight: "Physics: 100/100",
    color: "from-orange-400 to-red-400",
  },
  {
    id: 5,
    name: "Ishita Patel",
    exam: "JEE Advanced 2024",
    rank: "AIR 128",
    quote:
      "Gravity's structured approach transformed my physics preparation. The faculty's guidance on quantum mechanics was exceptional.",
    improvement: "From 60% to 98% in 8 months",
    highlight: "Physics: 99/120",
    color: "from-purple-400 to-pink-400",
  },
  {
    id: 6,
    name: "Vikram Singh",
    exam: "NEET 2024",
    rank: "AIR 234",
    quote:
      "The weekly tests and instant doubt resolution helped me master even the toughest concepts in electromagnetism.",
    improvement: "Rank improved by 15,000 positions",
    highlight: "Physics: 176/180",
    color: "from-blue-400 to-cyan-400",
  },
];

export default function StudentResults() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const rowOneRef = useRef<HTMLDivElement>(null);
  const rowTwoRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"results" | "stories">("results");

  // Infinite scroll animation
  useEffect(() => {
    if (!rowOneRef.current || !rowTwoRef.current) return;

    const widthOne = rowOneRef.current.scrollWidth / 2;
    const widthTwo = rowTwoRef.current.scrollWidth / 2;

    const tl1 = gsap.to(rowOneRef.current, {
      x: -widthOne,
      duration: 45,
      ease: "bounce.out(2.4)",

      repeat: -1,
    });

    const tl2 = gsap.fromTo(
      rowTwoRef.current,
      { x: -widthTwo },
      {
        x: 0,
        duration: 45,
        ease: "bounce.in(2.4)",
        repeat: -1,
      },
    );

    return () => {
      tl1.kill();
      tl2.kill();
    };
  }, [activeTab]);

  // Title animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-linear-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-linear(circle at 1px 1px, rgba(255, 215, 0, 0.05) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center max-w-3xl mx-auto mb-16">
          {/* Eyebrow text */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">
              Student Achievements
            </span>
          </div>

          {/* Main title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400">
              Results That
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400">
              Speak Themselves
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-400">
            Our students consistently achieve top ranks and breakthroughs in
            competitive exams. Here's what they've accomplished with Gravity.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("results")}
            className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
              activeTab === "results"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {activeTab === "results" && (
              <div className="absolute inset-0 bg-linear-to-r from-yellow-500 to-orange-500" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Exam Results
            </span>
          </button>

          <button
            onClick={() => setActiveTab("stories")}
            className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
              activeTab === "stories"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {activeTab === "stories" && (
              <div className="absolute inset-0 bg-linear-to-r from-purple-500 to-pink-500" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Success Stories
            </span>
          </button>
        </div>

        {/* Scrolling Cards - Row 1 */}
        <div className="relative mb-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-gray-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-gray-950 to-transparent z-10" />

          <div
            ref={rowOneRef}
            className="flex gap-6"
            style={{ width: "fit-content" }}
          >
            {/* Double the cards for seamless loop */}
            {(activeTab === "results" ? examResults : successStories).map(
              (item, index) => (
                <div key={`row1-${index}`} className="w-[320px] shrink-0">
                  {activeTab === "results" ? (
                    // Exam Result Card
                    <div className="group relative h-full">
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${(item as any).color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`}
                      />

                      <div className="relative h-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10">
                        {/* Rank badge */}
                        <div className="absolute -top-3 -right-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-50" />
                            <div
                              className={`relative w-16 h-16 bg-linear-to-br ${(item as any).color} rounded-full flex items-center justify-center border-2 border-white/20`}
                            >
                              <Medal className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Student info */}
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`w-16 h-16 rounded-full bg-linear-to-br ${(item as any).color} flex items-center justify-center text-2xl font-bold text-white`}
                          >
                            {(item as any).name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {(item as any).name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {(item as any).exam}
                            </p>
                          </div>
                        </div>

                        {/* Achievement stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Rank</p>
                            <p
                              className={`text-lg font-bold text-transparent bg-clip-text bg-linear-to-r ${(item as any).color}`}
                            >
                              {(item as any).rank}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Score</p>
                            <p
                              className={`text-lg font-bold text-transparent bg-clip-text bg-linear-to-r ${(item as any).color}`}
                            >
                              {(item as any).score}
                            </p>
                          </div>
                        </div>

                        {/* Achievement highlight */}
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">
                            {(item as any).achievement}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Success Story Card
                    <div className="group relative h-full">
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${(item as any).color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`}
                      />

                      <div className="relative h-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
                        {/* Quote icon */}
                        <Quote className="absolute top-4 right-4 w-8 h-8 text-purple-500/20" />

                        {/* Student info */}
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`w-16 h-16 rounded-full bg-linear-to-br ${(item as any).color} flex items-center justify-center text-2xl font-bold text-white`}
                          >
                            {(item as any).name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {(item as any).name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {(item as any).exam} • {(item as any).rank}
                            </p>
                          </div>
                        </div>

                        {/* Quote */}
                        <p className="text-gray-300 text-sm mb-4 italic">
                          "{(item as any).quote}"
                        </p>

                        {/* Improvement stats */}
                        <div className="bg-white/5 rounded-xl p-3 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">
                              {(item as any).improvement}
                            </span>
                          </div>
                        </div>

                        {/* Highlight */}
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">
                            {(item as any).highlight}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Scrolling Cards - Row 2 (opposite direction) */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-gray-950 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-gray-950 to-transparent z-10" />

          <div
            ref={rowTwoRef}
            className="flex gap-6"
            style={{ width: "fit-content" }}
          >
            {/* Double the cards for seamless loop */}
            {(activeTab === "results" ? examResults : successStories).map(
              (item, index) => (
                <div key={`row2-${index}`} className="w-[320px] shrink-0">
                  {activeTab === "results" ? (
                    // Exam Result Card
                    <div className="group relative h-full">
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${(item as any).color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`}
                      />

                      <div className="relative h-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10">
                        {/* Rank badge */}
                        <div className="absolute -top-3 -right-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-50" />
                            <div
                              className={`relative w-16 h-16 bg-linear-to-br ${(item as any).color} rounded-full flex items-center justify-center border-2 border-white/20`}
                            >
                              <Medal className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Student info */}
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`w-16 h-16 rounded-full bg-linear-to-br ${(item as any).color} flex items-center justify-center text-2xl font-bold text-white`}
                          >
                            {(item as any).name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {(item as any).name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {(item as any).exam}
                            </p>
                          </div>
                        </div>

                        {/* Achievement stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Rank</p>
                            <p
                              className={`text-lg font-bold text-transparent bg-clip-text bg-linear-to-r ${(item as any).color}`}
                            >
                              {(item as any).rank}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400 mb-1">Score</p>
                            <p
                              className={`text-lg font-bold text-transparent bg-clip-text bg-linear-to-r ${(item as any).color}`}
                            >
                              {(item as any).score}
                            </p>
                          </div>
                        </div>

                        {/* Achievement highlight */}
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300">
                            {(item as any).achievement}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Success Story Card
                    <div className="group relative h-full">
                      <div
                        className={`absolute inset-0 bg-linear-to-br ${(item as any).color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`}
                      />

                      <div className="relative h-full bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
                        {/* Quote icon */}
                        <Quote className="absolute top-4 right-4 w-8 h-8 text-purple-500/20" />

                        {/* Student info */}
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`w-16 h-16 rounded-full bg-linear-to-br ${(item as any).color} flex items-center justify-center text-2xl font-bold text-white`}
                          >
                            {(item as any).name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {(item as any).name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {(item as any).exam} • {(item as any).rank}
                            </p>
                          </div>
                        </div>

                        {/* Quote */}
                        <p className="text-gray-300 text-sm mb-4 italic">
                          "{(item as any).quote}"
                        </p>

                        {/* Improvement stats */}
                        <div className="bg-white/5 rounded-xl p-3 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300">
                              {(item as any).improvement}
                            </span>
                          </div>
                        </div>

                        {/* Highlight */}
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300">
                            {(item as any).highlight}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              value: "500+",
              label: "Top 100 Ranks",
              icon: Trophy,
              color: "from-yellow-400 to-orange-400",
            },
            {
              value: "95%",
              label: "Success Rate",
              icon: Target,
              color: "from-green-400 to-emerald-400",
            },
            {
              value: "50+",
              label: "Perfect Scores",
              icon: Star,
              color: "from-blue-400 to-cyan-400",
            },
            {
              value: "1000+",
              label: "Success Stories",
              icon: Award,
              color: "from-purple-400 to-pink-400",
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="relative group">
                <div
                  className={`absolute inset-0 bg-linear-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}
                />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-linear-to-r ${stat.color} bg-opacity-10 mb-3`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <Link
            href="/results"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-yellow-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105"
          >
            View All Results
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
