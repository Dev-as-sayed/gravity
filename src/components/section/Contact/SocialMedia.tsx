// components/SocialMedia.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  MessageCircle,
  Share2,
  Sparkles,
  ChevronRight,
  Users,
  Heart,
  MessageSquare,
  Eye,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface SocialMediaProps {
  title?: string;
  subtitle?: string;
  showStats?: boolean;
}

const socialPlatforms = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "from-blue-600 to-blue-400",
    bgColor: "bg-blue-600/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-400",
    hoverColor: "hover:bg-blue-600",
    url: "https://facebook.com/gravityphysics",
    followers: "50K+",
    engagement: "95%",
    posts: "500+",
    description: "Join our community for daily physics discussions",
  },
  {
    name: "Instagram",
    icon: Instagram,
    color: "from-pink-500 via-purple-500 to-orange-500",
    bgColor: "bg-pink-600/10",
    borderColor: "border-pink-500/20",
    textColor: "text-pink-400",
    hoverColor: "hover:bg-pink-600",
    url: "https://instagram.com/gravityphysics",
    followers: "100K+",
    engagement: "98%",
    posts: "1K+",
    description: "Visual physics concepts and reels",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "from-blue-700 to-blue-500",
    bgColor: "bg-blue-700/10",
    borderColor: "border-blue-600/20",
    textColor: "text-blue-500",
    hoverColor: "hover:bg-blue-700",
    url: "https://linkedin.com/company/gravityphysics",
    followers: "75K+",
    engagement: "92%",
    posts: "300+",
    description: "Professional networking and career tips",
  },
  {
    name: "X (Twitter)",
    icon: Twitter,
    color: "from-slate-600 to-slate-400",
    bgColor: "bg-slate-600/10",
    borderColor: "border-slate-500/20",
    textColor: "text-slate-400",
    hoverColor: "hover:bg-slate-600",
    url: "https://twitter.com/gravityphysics",
    followers: "80K+",
    engagement: "96%",
    posts: "2K+",
    description: "Quick physics facts and updates",
  },
  {
    name: "YouTube",
    icon: Youtube,
    color: "from-red-600 to-red-400",
    bgColor: "bg-red-600/10",
    borderColor: "border-red-500/20",
    textColor: "text-red-400",
    hoverColor: "hover:bg-red-600",
    url: "https://youtube.com/@gravityphysics",
    followers: "200K+",
    engagement: "89%",
    posts: "450+",
    description: "Video lectures and tutorials",
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "from-green-600 to-green-400",
    bgColor: "bg-green-600/10",
    borderColor: "border-green-500/20",
    textColor: "text-green-400",
    hoverColor: "hover:bg-green-600",
    url: "https://wa.me/1234567890",
    followers: "25K+",
    engagement: "99%",
    posts: "Daily",
    description: "Instant doubt resolution",
  },
];

export default function SocialMedia({
  title = "Connect With Us",
  subtitle = "Join our growing community across all platforms. Stay updated with the latest in physics.",
  showStats = true,
}: SocialMediaProps) {
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
        },
      });

      // Cards animation
      gsap.from(".social-card", {
        scale: 0.8,
        opacity: 0,
        y: 60,
        duration: 0.8,
        stagger: 0.1,
        ease: "backOut(1.2)",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
        },
      });

      // Floating particles animation
      gsap.to(".social-particle", {
        y: "random(-30, 30)",
        x: "random(-30, 30)",
        duration: "random(8, 15)",
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
      className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

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

        {/* Floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="social-particle absolute w-1 h-1 bg-blue-400/20 rounded-full"
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
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <Share2 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Social Media
            </span>
          </div>

          {/* Main title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {title.split(" ")[0]}{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              {title.split(" ").slice(1).join(" ")}
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-400">{subtitle}</p>
        </div>
        {/* Social Cards Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
        >
          {socialPlatforms.map((platform, index) => {
            const Icon = platform.icon;

            return (
              <Link
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card group relative block"
              >
                {/* Card background glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${platform.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`}
                />

                {/* Main card */}
                <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                  {/* Header with icon and name */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Icon with gradient */}
                    <div className="relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${platform.color} rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}
                      />
                      <div
                        className={`relative w-14 h-14 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Name and followers */}
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all">
                        {platform.name}
                      </h3>
                      {showStats && (
                        <p className={`text-sm ${platform.textColor}`}>
                          {platform.followers} followers
                        </p>
                      )}
                    </div>

                    {/* Engagement badge */}
                    {showStats && (
                      <div className="ml-auto">
                        <div
                          className={`px-3 py-1 rounded-full bg-gradient-to-r ${platform.color} bg-opacity-20 border ${platform.borderColor}`}
                        >
                          <span
                            className={`text-xs font-medium ${platform.textColor}`}
                          >
                            {platform.engagement}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {platform.description}
                  </p>

                  {/* Follow button */}
                  <div
                    className={`absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    <div
                      className={`px-4 py-2 bg-gradient-to-r ${platform.color} rounded-lg text-white text-sm font-medium flex items-center gap-1`}
                    >
                      Follow
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Decorative corner gradient */}
                  <div
                    className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${platform.color} opacity-0 group-hover:opacity-10 rounded-br-3xl transition-opacity duration-500`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600">
            <Sparkles className="w-4 h-4 inline-block mr-1 text-yellow-400" />
            Follow us for daily physics facts, tips, and updates
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-15px) translateX(8px);
          }
          66% {
            transform: translateY(8px) translateX(-8px);
          }
        }

        .social-particle {
          animation: float 12s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
