// components/MediaHero.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Play,
  Film,
  Clock,
  Eye,
  ThumbsUp,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Calendar,
  Users,
  Award,
  PlayCircle,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface MediaHeroProps {
  featuredVideo?: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    views: string;
    likes: string;
    instructor: string;
    date: string;
    category: string;
    videoUrl: string;
  };
  stats?: {
    value: string;
    label: string;
    icon: any;
  }[];
}

const defaultFeaturedVideo = {
  id: "1",
  title: "Quantum Mechanics: The Complete Introduction",
  description:
    "Dive into the fascinating world of quantum mechanics with Dr. Arjun Sharma. This comprehensive lecture covers wave-particle duality, the Schrödinger equation, and the fundamental principles that govern the quantum world.",
  thumbnail: "/media/featured-quantum.jpg",
  duration: "1:45:30",
  views: "245K",
  likes: "28.5K",
  instructor: "Dr. Arjun Sharma",
  date: "2024-05-15",
  category: "Quantum Physics",
  videoUrl: "https://youtube.com/watch?v=featured",
};

const defaultStats = [
  { value: "500+", label: "Video Lectures", icon: Film },
  { value: "2M+", label: "Total Views", icon: Eye },
  { value: "50K+", label: "Subscribers", icon: Users },
  { value: "4.9", label: "Avg Rating", icon: Award },
];

export default function MediaHero({
  featuredVideo = defaultFeaturedVideo,
  stats = defaultStats,
}: MediaHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main content animation
      gsap.from(contentRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      // Stats animation
      gsap.from(".stat-item", {
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "backOut(1.2)",
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 90%",
        },
      });

      // Floating particles animation
      gsap.to(".media-particle", {
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

      // Pulsing play button animation
      gsap.to(".play-pulse", {
        scale: 1.2,
        opacity: 0.5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Floating particles */}
        <div ref={particlesRef} className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="media-particle absolute w-1 h-1 bg-orange-400/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(249, 115, 22, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(249, 115, 22, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div ref={contentRef} className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            {/* Eyebrow text */}
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <Film className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">
                Media Library
              </span>
            </div>

            {/* Main title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Physics
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-purple-400">
                Video Lectures
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Explore our extensive collection of high-quality physics video
              lectures. Learn from expert faculty through comprehensive,
              engaging, and visually rich content.
            </p>
          </div>

          {/* Featured Video Card */}
          <div className="group relative mb-16">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-700" />

            {/* Main card */}
            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8 p-8">
                {/* Video Thumbnail */}
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                  {/* Placeholder for thumbnail */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <div className="play-pulse absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-50" />
                        <div className="relative w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center cursor-pointer transform group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-sm text-white">
                    {featuredVideo.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex flex-col justify-center">
                  {/* Featured badge */}
                  <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-4 w-fit">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-orange-400">
                      Featured Lecture
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {featuredVideo.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {featuredVideo.description}
                  </p>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4 text-orange-400" />
                      <span className="text-sm">
                        {featuredVideo.instructor}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span className="text-sm">
                        {new Date(featuredVideo.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Eye className="w-4 h-4 text-orange-400" />
                      <span className="text-sm">
                        {featuredVideo.views} views
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <ThumbsUp className="w-4 h-4 text-orange-400" />
                      <span className="text-sm">
                        {featuredVideo.likes} likes
                      </span>
                    </div>
                  </div>

                  {/* Category tag */}
                  <div className="mb-6">
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full text-sm text-orange-400 border border-orange-500/30">
                      {featuredVideo.category}
                    </span>
                  </div>

                  {/* Watch button */}
                  <Link
                    href={featuredVideo.videoUrl}
                    className="group/btn relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/25 w-fit"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <PlayCircle className="w-5 h-5" />
                      Watch Featured Lecture
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(10px);
            opacity: 0;
          }
        }

        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </section>
  );
}
