// components/QuickContact.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MessageCircle,
  Mail,
  Phone,
  Send,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface QuickContactProps {
  title?: string;
  description?: string;
  whatsapp?: {
    number: string;
    message?: string;
    label?: string;
  };
  email?: {
    address: string;
    label?: string;
    responseTime?: string;
  };
  phone?: {
    number: string;
    label?: string;
    hours?: string;
  };
  showResponseTime?: boolean;
}

export default function QuickContact({
  title = "Quick Contact Options",
  description = "Get in touch with us instantly through your preferred channel. We're here to help 24/7.",
  whatsapp = {
    number: "+91 98765 43210",
    message: "Hi Gravity! I need help with...",
    label: "WhatsApp",
  },
  email = {
    address: "support@gravity.com",
    label: "Email Support",
    responseTime: "< 2 hours",
  },
  phone = {
    number: "+91 12345 67890",
    label: "Call Us",
    hours: "24/7 Support",
  },
  showResponseTime = true,
}: QuickContactProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Cards animation
      gsap.from(".contact-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "backOut(1.2)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Decorative particles animation
      gsap.to(".contact-particle", {
        y: "random(-30, 30)",
        x: "random(-30, 30)",
        duration: "random(6, 12)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 1.5,
          from: "random",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      whatsapp.message || "Hi Gravity! I need help with...",
    );
    const url = `https://wa.me/${whatsapp.number.replace(/\D/g, "")}?text=${text}`;
    window.open(url, "_blank");
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email.address}`;
  };

  const handlePhone = () => {
    window.location.href = `tel:${phone.number.replace(/\D/g, "")}`;
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="contact-particle absolute w-1 h-1 bg-green-500/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-4 backdrop-blur-sm">
            <MessageCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              Instant Connect
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {title.split(" ")[0]}{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-400 to-purple-400">
              {title.split(" ").slice(1).join(" ")}
            </span>
          </h2>

          <p className="text-gray-400">{description}</p>
        </div>

        {/* Contact Cards Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {/* WhatsApp Card */}
          <div className="contact-card group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-green-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10">
              {/* Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {whatsapp.label || "WhatsApp"}
              </h3>

              <p className="text-gray-400 text-sm mb-4">
                Chat instantly with our support team
              </p>

              <div className="flex items-center gap-2 text-green-400 mb-6">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Typically replies in 5 mins</span>
              </div>

              {/* Number display */}
              <div className="bg-white/5 rounded-xl p-3 mb-6">
                <p className="text-lg font-mono text-white text-center">
                  {whatsapp.number}
                </p>
              </div>

              {/* Action button */}
              <button
                onClick={handleWhatsApp}
                className="w-full group/btn relative px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </span>
              </button>

              {/* Decorative corner */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-green-500/10 to-transparent rounded-br-3xl" />
            </div>
          </div>

          {/* Email Card */}
          <div className="contact-card group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
              {/* Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {email.label || "Email"}
              </h3>

              <p className="text-gray-400 text-sm mb-4">
                Send us your queries anytime
              </p>

              {showResponseTime && (
                <div className="flex items-center gap-2 text-blue-400 mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Response in {email.responseTime}
                  </span>
                </div>
              )}

              {/* Email display */}
              <div className="bg-white/5 rounded-xl p-3 mb-6">
                <p className="text-lg text-white text-center break-all">
                  {email.address}
                </p>
              </div>

              {/* Action button */}
              <button
                onClick={handleEmail}
                className="w-full group/btn relative px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Email
                </span>
              </button>

              {/* Decorative corner */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-br-3xl" />
            </div>
          </div>

          {/* Phone Card */}
          <div className="contact-card group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

            <div className="relative bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
              {/* Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Phone className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {phone.label || "Phone"}
              </h3>

              <p className="text-gray-400 text-sm mb-4">
                Speak directly with our team
              </p>

              <div className="flex items-center gap-2 text-purple-400 mb-6">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{phone.hours}</span>
              </div>

              {/* Phone display */}
              <div className="bg-white/5 rounded-xl p-3 mb-6">
                <p className="text-lg font-mono text-white text-center">
                  {phone.number}
                </p>
              </div>

              {/* Action button */}
              <button
                onClick={handlePhone}
                className="w-full group/btn relative px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Now
                </span>
              </button>

              {/* Decorative corner */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-br-3xl" />
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600">
            <Sparkles className="w-4 h-4 inline-block mr-1 text-yellow-400" />
            All options are monitored 24/7. Average response time: {"<"} 2 hours
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
            transform: translateY(-10px) translateX(5px);
          }
          66% {
            transform: translateY(5px) translateX(-5px);
          }
        }

        .contact-particle {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
