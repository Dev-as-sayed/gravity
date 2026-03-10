// components/KeyBenefits.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GraduationCap,
  BookOpen,
  Video,
  PenTool,
  Users,
  Trophy,
  Clock,
  Infinity,
  Atom,
  Zap,
  Globe,
  Sparkles,
  Target,
  BarChart,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  {
    id: 1,
    title: "Expert Teachers",
    description:
      "Learn from PhD holders and research scientists from top institutions like IIT, MIT, and CERN.",
    icon: GraduationCap,
    color: "from-blue-400 to-cyan-400",
    stats: "50+ Experts",
    gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
  },
  {
    id: 2,
    title: "Structured Curriculum",
    description:
      "Systematic learning paths from fundamentals to advanced topics, designed by pedagogy experts.",
    icon: BookOpen,
    color: "from-purple-400 to-pink-400",
    stats: "200+ Modules",
    gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
  },
  {
    id: 3,
    title: "Recorded + Live Classes",
    description:
      "Flexible learning with recorded lectures and interactive live sessions for doubt clearing.",
    icon: Video,
    color: "from-green-400 to-emerald-400",
    stats: "500+ Hours",
    gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
  },
  {
    id: 4,
    title: "Weekly Tests",
    description:
      "Regular assessments with detailed performance analytics to track your progress.",
    icon: PenTool,
    color: "from-orange-400 to-red-400",
    stats: "52 Tests/Year",
    gradient: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
  },
  {
    id: 5,
    title: "Peer Learning",
    description:
      "Join study groups, discuss concepts, and collaborate with fellow physics enthusiasts.",
    icon: Users,
    color: "from-indigo-400 to-blue-400",
    stats: "10K+ Peers",
    gradient: "bg-gradient-to-br from-indigo-500/20 to-blue-500/20",
  },
  {
    id: 6,
    title: "Doubt Resolution",
    description:
      "24/7 doubt support with dedicated mentors and community Q&A forums.",
    icon: MessageCircle,
    color: "from-pink-400 to-rose-400",
    stats: "< 2hr Response",
    gradient: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
  },
];

export default function KeyBenefits() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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
          end: "top 50%",
          scrub: 1,
        },
      });

      // Cards stagger animation
      gsap.from(".benefit-card", {
        y: 200,
        opacity: 0,
        scale: 0.8,
        duration: 1.2,
        stagger: 0.2,
        ease: "backOut(1.2)",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
          end: "top 30%",
          scrub: 1,
        },
      });

      // Floating particles animation
      gsap.to(".floating-particle", {
        y: "random(-30, 30)",
        x: "random(-30, 30)",
        rotation: "random(-180, 180)",
        duration: "random(5, 10)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="floating-particle absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div ref={titleRef} className="text-center max-w-3xl mx-auto mb-20">
          {/* Eyebrow text */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Why Choose Us
            </span>
          </div>

          {/* Main title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Key Benefits of
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Gravity Platform
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-400">
            Discover why thousands of students choose Gravity for their physics
            journey. We provide everything you need to master physics.
          </p>
        </div>

        {/* Benefits grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.id} className="benefit-card group relative">
                {/* Card background with hover effect */}
                <div
                  className={`absolute inset-0 ${benefit.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
                />

                {/* Main card */}
                <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                  {/* Icon with gradient */}
                  <div className={`relative inline-block mb-6`}>
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${benefit.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`}
                    />
                    <div
                      className={`relative w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {benefit.title}
                  </h3>

                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {benefit.description}
                  </p>

                  {/* Stats and decorative elements */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r ${benefit.color}`}
                    >
                      {benefit.stats}
                    </span>

                    {/* Animated dots */}
                    <div className="flex gap-1">
                      {[1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          className={`w-1 h-1 rounded-full bg-gradient-to-r ${benefit.color} opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300`}
                          style={{ transitionDelay: `${dot * 100}ms` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Decorative corner gradient */}
                  <div
                    className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 rounded-br-3xl transition-opacity duration-500 pointer-events-none`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 pl-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-gray-900"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-300">
                Join <span className="text-white font-bold">10,000+</span>{" "}
                students
              </span>
            </div>
            <Link
              href="/enroll"
              className="group px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              Start Learning
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Additional decorative elements */}
      <div className="absolute left-0 top-1/3 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute right-0 bottom-1/3 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

      <style jsx>{`
        @keyframes float-particle {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -10px) rotate(90deg);
          }
          50% {
            transform: translate(20px, 0) rotate(180deg);
          }
          75% {
            transform: translate(10px, 10px) rotate(270deg);
          }
        }

        .floating-particle {
          animation: float-particle 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
