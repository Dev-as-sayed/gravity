// components/FreeResources.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  FileText,
  BookOpen,
  Video,
  Newspaper,
  Download,
  Play,
  Eye,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Atom,
  Zap,
  Globe,
  Brain,
  Infinity,
  Calculator,
  FlaskConical,
  Microscope,
  Rocket,
  Star,
  Clock,
  Users,
  Award,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Notes categories
const notesCategories = [
  {
    title: "Classical Mechanics",
    description:
      "Comprehensive notes on Newton's laws, Lagrangian mechanics, and more",
    icon: Atom,
    color: "from-blue-400 to-cyan-400",
    count: 12,
    topics: [
      "Kinematics",
      "Laws of Motion",
      "Rotational Mechanics",
      "Gravitation",
    ],
  },
  {
    title: "Electromagnetism",
    description:
      "Complete coverage of electrostatics, magnetism, and Maxwell's equations",
    icon: Zap,
    color: "from-yellow-400 to-orange-400",
    count: 15,
    topics: ["Electrostatics", "Magnetism", "EM Waves", "Circuits"],
  },
  {
    title: "Quantum Mechanics",
    description:
      "From wave-particle duality to Schrödinger equation and beyond",
    icon: Infinity,
    color: "from-purple-400 to-pink-400",
    count: 10,
    topics: ["Wave Function", "Operators", "Spin", "Perturbation Theory"],
  },
  {
    title: "Thermodynamics",
    description:
      "Laws of thermodynamics, heat transfer, and statistical mechanics",
    icon: FlaskConical,
    color: "from-red-400 to-rose-400",
    count: 8,
    topics: ["Laws", "Entropy", "Heat Engines", "Kinetic Theory"],
  },
];

// Blog posts
const blogPosts = [
  {
    title: "Understanding Quantum Entanglement",
    excerpt:
      "A beginner's guide to one of quantum mechanics' most fascinating phenomena",
    author: "Dr. Arjun Sharma",
    date: "May 15, 2024",
    readTime: "8 min read",
    category: "Quantum Physics",
    image: "/blog/quantum.jpg", // Replace with actual images
    icon: Brain,
    color: "from-purple-400 to-pink-400",
  },
  {
    title: "5 Common Misconceptions About Relativity",
    excerpt:
      "Debunking myths about Einstein's theory of special and general relativity",
    author: "Prof. Neha Gupta",
    date: "May 10, 2024",
    readTime: "6 min read",
    category: "Relativity",
    icon: Rocket,
    color: "from-blue-400 to-cyan-400",
  },
  {
    title: "The Future of Particle Physics",
    excerpt:
      "What's next after the Higgs boson? Exploring upcoming experiments",
    author: "Dr. Rahul Verma",
    date: "May 5, 2024",
    readTime: "10 min read",
    category: "Particle Physics",
    icon: Atom,
    color: "from-green-400 to-emerald-400",
  },
  {
    title: "Mastering Electromagnetic Induction",
    excerpt: "Tips and tricks to solve complex problems in EMI",
    author: "Prof. Priya Singh",
    date: "April 28, 2024",
    readTime: "7 min read",
    category: "Electromagnetism",
    icon: Zap,
    color: "from-yellow-400 to-orange-400",
  },
];

// Media lectures
const mediaLectures = [
  {
    title: "Introduction to Quantum Mechanics",
    instructor: "Dr. Arjun Sharma",
    duration: "45 mins",
    views: "12.5K",
    level: "Beginner",
    thumbnail: "/lectures/quantum.jpg",
    icon: Brain,
    color: "from-purple-400 to-pink-400",
  },
  {
    title: "Maxwell's Equations Explained",
    instructor: "Prof. Neha Gupta",
    duration: "52 mins",
    views: "8.3K",
    level: "Intermediate",
    thumbnail: "/lectures/maxwell.jpg",
    icon: Zap,
    color: "from-yellow-400 to-orange-400",
  },
  {
    title: "Special Relativity in 3D",
    instructor: "Dr. Rahul Verma",
    duration: "38 mins",
    views: "15.2K",
    level: "Advanced",
    thumbnail: "/lectures/relativity.jpg",
    icon: Rocket,
    color: "from-blue-400 to-cyan-400",
  },
  {
    title: "Thermodynamics: Laws & Applications",
    instructor: "Prof. Priya Singh",
    duration: "41 mins",
    views: "6.7K",
    level: "Beginner",
    thumbnail: "/lectures/thermo.jpg",
    icon: FlaskConical,
    color: "from-red-400 to-rose-400",
  },
];

export default function FreeResources() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "blog" | "media">(
    "notes",
  );

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
      gsap.from(".resource-card", {
        scale: 0.9,
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
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
        <div className="absolute top-20 left-10 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.05) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-500/20 rounded-full animate-float"
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
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <GraduationCap className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              Free Learning Resources
            </span>
          </div>

          {/* Main title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Learn Physics,
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Absolutely Free
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-400">
            Access our comprehensive library of notes, blogs, and video
            lectures. No signup required. Start learning today.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="tab-buttons flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("notes")}
            className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
              activeTab === "notes"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {activeTab === "notes" && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notes (PDF)
            </span>
          </button>

          <button
            onClick={() => setActiveTab("blog")}
            className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
              activeTab === "blog"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {activeTab === "blog" && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Blog
            </span>
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
              activeTab === "media"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {activeTab === "media" && (
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Video className="w-5 h-5" />
              Media Lectures
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="mt-12">
          {activeTab === "notes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notesCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={index} className="resource-card group relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                    />

                    <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-500">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`relative shrink-0`}>
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}
                          />
                          <div
                            className={`relative w-14 h-14 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-white">
                              {category.title}
                            </h3>
                            <span className="text-sm text-green-400">
                              {category.count} PDFs
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">
                            {category.description}
                          </p>

                          {/* Topics */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {category.topics.map((topic, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-white/5 rounded-full text-gray-300"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>

                          {/* Download button */}
                          <Link
                            href={`/resources/notes/${category.title.toLowerCase().replace(/\s+/g, "-")}`}
                            className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors group/link"
                          >
                            <Download className="w-4 h-4" />
                            Download Notes
                            <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "blog" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogPosts.map((post, index) => {
                const Icon = post.icon;
                return (
                  <div key={index} className="resource-card group relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${post.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                    />

                    <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-500">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`relative shrink-0`}>
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${post.color} rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}
                          />
                          <div
                            className={`relative w-14 h-14 bg-gradient-to-r ${post.color} rounded-xl flex items-center justify-center`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs px-2 py-1 bg-gradient-to-r ${post.color} bg-opacity-20 rounded-full text-white`}
                            >
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {post.readTime}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-white mb-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              By {post.author} • {post.date}
                            </div>

                            <Link
                              href={`/blog/${post.title.toLowerCase().replace(/\s+/g, "-")}`}
                              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Read More
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "media" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mediaLectures.map((lecture, index) => {
                const Icon = lecture.icon;
                return (
                  <div key={index} className="resource-card group relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${lecture.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}
                    />

                    <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500">
                      {/* Video thumbnail placeholder */}
                      <div
                        className={`h-32 bg-gradient-to-r ${lecture.color} bg-opacity-20 relative`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${lecture.color} bg-opacity-20`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">
                              {lecture.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {lecture.instructor}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {lecture.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {lecture.views} views
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${lecture.color} bg-opacity-20 text-white`}
                          >
                            {lecture.level}
                          </span>
                        </div>

                        <Link
                          href={`/lectures/${lecture.title.toLowerCase().replace(/\s+/g, "-")}`}
                          className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors group/link"
                        >
                          <Play className="w-4 h-4" />
                          Watch Lecture
                          <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            href="/resources"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold text-white hover:bg-white/10 transition-all duration-300"
          >
            Browse All Resources
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            {
              value: "45+",
              label: "PDF Notes",
              icon: FileText,
              color: "from-green-400 to-blue-400",
            },
            {
              value: "120+",
              label: "Blog Posts",
              icon: Newspaper,
              color: "from-purple-400 to-pink-400",
            },
            {
              value: "80+",
              label: "Video Lectures",
              icon: Video,
              color: "from-orange-400 to-red-400",
            },
            {
              value: "50K+",
              label: "Monthly Readers",
              icon: Users,
              color: "from-blue-400 to-cyan-400",
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
