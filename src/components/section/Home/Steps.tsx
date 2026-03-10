"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  UserPlus,
  BookOpen,
  PenTool,
  Award,
  Rocket,
  Target,
  Zap,
  Brain,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    id: "01",
    title: "Join",
    description:
      "Enroll in your preferred batch, get access to learning materials, and connect with peers and mentors.",
    icon: UserPlus,
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: "02",
    title: "Learn",
    description:
      "Master concepts through recorded lectures, live sessions, and interactive simulations with expert faculty.",
    icon: BookOpen,
    color: "from-purple-400 to-pink-400",
  },
  {
    id: "03",
    title: "Practice",
    description:
      "Reinforce learning with thousands of practice problems, weekly tests, and instant performance analytics.",
    icon: PenTool,
    color: "from-green-400 to-emerald-400",
  },
  {
    id: "04",
    title: "Master",
    description:
      "Achieve mastery with advanced problem-solving, doubt resolution, and personalized learning paths.",
    icon: Award,
    color: "from-orange-400 to-red-400",
  },
];

// Optional: Extended version with more steps
export const extendedSteps = [
  {
    id: "01",
    title: "Discover",
    description:
      "Find your perfect batch based on your goals and current level.",
    icon: Rocket,
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: "02",
    title: "Enroll",
    description:
      "Quick registration process with instant access to learning portal.",
    icon: UserPlus,
    color: "from-indigo-400 to-blue-400",
  },
  {
    id: "03",
    title: "Learn",
    description:
      "Engage with video lectures, live classes, and interactive content.",
    icon: BookOpen,
    color: "from-purple-400 to-pink-400",
  },
  {
    id: "04",
    title: "Practice",
    description:
      "Test your knowledge with quizzes, assignments, and mock tests.",
    icon: Target,
    color: "from-green-400 to-emerald-400",
  },
  {
    id: "05",
    title: "Revise",
    description: "Quick revision modules and formula sheets for reinforcement.",
    icon: Brain,
    color: "from-yellow-400 to-amber-400",
  },
  {
    id: "06",
    title: "Excel",
    description:
      "Advanced topics, research projects, and competition preparation.",
    icon: Zap,
    color: "from-orange-400 to-red-400",
  },
];

export default function StepsSection() {
  const sectionRef = useRef<HTMLTableSectionElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${steps.length * 250}`,
          scrub: true,
          pin: true,
        },
      });

      // Progress line animation
      tl.fromTo(
        progressRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          duration: steps.length,
          ease: "none",
        },
      );

      // Step animations
      stepRefs.current.forEach((step, index) => {
        tl.fromTo(
          step,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          index,
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-24 relative z-10">
        {/* Section Header */}
        <div className="mb-16 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Rocket className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Your Journey
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Learning Path
            </span>
          </h2>

          <p className="text-gray-400 text-lg">
            From absolute beginner to physics master — follow our proven 4-step
            journey designed for optimal learning outcomes.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-[80px_1fr] gap-12">
          {/* Progress Line */}
          <div className="relative hidden md:flex justify-center">
            <div className="h-full w-1 bg-white/10 overflow-hidden rounded-full">
              <div
                ref={progressRef}
                className="h-full w-full bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"
                style={{ transform: "scaleY(0)", transformOrigin: "top" }}
              />
            </div>

            {/* Step indicators on timeline */}
            <div className="absolute top-0 -left-1 w-3 h-3 rounded-full bg-blue-500" />
            <div className="absolute top-1/3 -left-1 w-3 h-3 rounded-full bg-purple-500" />
            <div className="absolute top-2/3 -left-1 w-3 h-3 rounded-full bg-pink-500" />
            <div className="absolute bottom-0 -left-1 w-3 h-3 rounded-full bg-orange-500" />
          </div>

          {/* Steps */}
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  ref={(el) => {
                    if (el) stepRefs.current[index] = el;
                  }}
                  className="flex gap-6 items-start opacity-0 group"
                >
                  {/* Icon with gradient */}
                  <div className="relative shrink-0">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500`}
                    />
                    <div
                      className={`relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}
                    >
                      <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>

                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center border-2 border-blue-500/30 group-hover:border-blue-500 transition-colors">
                      <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {step.id}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-3xl md:text-4xl font-bold mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                      {step.title}
                    </h3>

                    <p className="text-gray-400 text-lg leading-relaxed max-w-lg group-hover:text-gray-300 transition-colors">
                      {step.description}
                    </p>

                    {/* Animated progress dots */}
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color} opacity-30 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300`}
                          style={{ transitionDelay: `${dot * 100}ms` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Decorative line connecting to progress */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-12 top-24 w-px h-16 bg-gradient-to-b from-white/20 to-transparent hidden md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
            <span className="text-sm text-gray-400">
              Ready to start your journey?
            </span>
            <button className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
              Enroll Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }

        .step-indicator {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
