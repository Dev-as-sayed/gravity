// components/StudentResults.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  GraduationCap,
  Medal,
  Sparkles,
  Target,
  Zap,
  Brain,
  Rocket,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Exam results data
const examResults = [
  {
    exam: "JEE Advanced 2024",
    rank: "AIR 42",
    name: "Arjun Mehta",
    score: "98.7%",
    image: "/students/arjun.jpg", // Replace with actual images
    achievement: "Top 0.1% in Physics",
  },
  {
    exam: "NEET 2024",
    rank: "AIR 156",
    name: "Priya Sharma",
    score: "715/720",
    image: "/students/priya.jpg",
    achievement: "Perfect Score in Physics",
  },
  {
    exam: "IIT JAM 2024",
    rank: "AIR 7",
    name: "Rahul Verma",
    score: "92%",
    image: "/students/rahul.jpg",
    achievement: "Physics Topper",
  },
  {
    exam: "CUET 2024",
    rank: "99.8 Percentile",
    name: "Neha Gupta",
    score: "580/600",
    image: "/students/neha.jpg",
    achievement: "Physics: 198/200",
  },
  {
    exam: "KVPY 2023",
    rank: "Fellowship",
    name: "Aditya Kumar",
    score: "SA Topper",
    image: "/students/aditya.jpg",
    achievement: "Research Grant Recipient",
  },
  {
    exam: "JEE Main 2024",
    rank: "99.96 Percentile",
    name: "Sneha Reddy",
    score: "295/300",
    image: "/students/sneha.jpg",
    achievement: "Physics: 99/100",
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
      "Gravity's structured approach to problem-solving transformed my physics preparation. The faculty's guidance on quantum mechanics was exceptional.",
    image: "/students/ishita.jpg",
    improvement: "From 60% to 98% in 8 months",
    highlight: "Physics: 99/120",
  },
  {
    id: 2,
    name: "Vikram Singh",
    exam: "NEET 2024",
    rank: "AIR 234",
    quote:
      "The weekly tests and instant doubt resolution helped me master even the toughest concepts in electromagnetism and mechanics.",
    image: "/students/vikram.jpg",
    improvement: "Rank improved by 15,000 positions",
    highlight: "Physics: 176/180",
  },
  {
    id: 3,
    name: "Ananya Desai",
    exam: "IIT JAM 2024",
    rank: "AIR 15",
    quote:
      "The advanced problem-solving sessions and mock interviews prepared me exceptionally well for the physics Olympiad.",
    image: "/students/ananya.jpg",
    improvement: "AIR 450 to AIR 15 in 1 year",
    highlight: "Selected for INSPIRE Fellowship",
  },
  {
    id: 4,
    name: "Rohan Khanna",
    exam: "JEE Main 2024",
    rank: "99.9 Percentile",
    quote:
      "The recorded lectures allowed me to learn at my own pace, and the live doubt sessions clarified every concept.",
    image: "/students/rohan.jpg",
    improvement: "From 85% to 99.9%ile in 6 months",
    highlight: "Physics: 100/100",
  },
];

export default function StudentResults() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"results" | "stories">("results");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Tab animation
      gsap.from(".tab-buttons", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      // Cards animation
      gsap.from(".result-card", {
        scale: 0.8,
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [activeTab]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 215, 0, 0.05) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-500/20 rounded-full animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${10 + i * 2}s`,
            }}
          />
        ))}
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Results That
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
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
        <div className="tab-buttons flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("results")}
            className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
              activeTab === "results"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {activeTab === "results" && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500" />
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Success Stories
            </span>
          </button>
        </div>

        {/* Content Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {activeTab === "results"
            ? examResults.map((result, index) => (
                <div key={index} className="result-card group relative">
                  {/* Card background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                  {/* Main card */}
                  <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/10">
                    {/* Rank badge */}
                    <div className="absolute -top-3 -right-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-50" />
                        <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center border-2 border-white/20">
                          <Medal className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Student info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-2xl font-bold text-white">
                        {result.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {result.name}
                        </h3>
                        <p className="text-sm text-gray-400">{result.exam}</p>
                      </div>
                    </div>

                    {/* Achievement stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">Rank</p>
                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                          {result.rank}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">Score</p>
                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                          {result.score}
                        </p>
                      </div>
                    </div>

                    {/* Achievement highlight */}
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">
                        {result.achievement}
                      </span>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-yellow-500/10 to-transparent rounded-br-3xl" />
                  </div>
                </div>
              ))
            : successStories.map((story, index) => (
                <div key={story.id} className="result-card group relative">
                  {/* Card background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                  {/* Main card */}
                  <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
                    {/* Quote icon */}
                    <Quote className="absolute top-4 right-4 w-8 h-8 text-purple-500/20" />

                    {/* Student info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white">
                        {story.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {story.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {story.exam} • {story.rank}
                        </p>
                      </div>
                    </div>

                    {/* Quote */}
                    <p className="text-gray-300 text-sm mb-4 italic">
                      "{story.quote}"
                    </p>

                    {/* Improvement stats */}
                    <div className="bg-white/5 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">
                          {story.improvement}
                        </span>
                      </div>
                    </div>

                    {/* Highlight */}
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{story.highlight}</span>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-bl-3xl" />
                  </div>
                </div>
              ))}
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
                  className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}
                />
                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10 mb-3`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
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
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 transform hover:scale-105"
          >
            View All Results
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }

        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
