// components/MapSection.tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin,
  Building,
  Phone,
  Mail,
  Clock,
  Globe,
  Navigation,
  ChevronRight,
  Sparkles,
  Users,
  Award,
  Target,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface MapSectionProps {
  title?: string;
  subtitle?: string;
  address?: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contact?: {
    phone: string;
    email: string;
    website: string;
  };
  hours?: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  stats?: {
    students: string;
    faculty: string;
    experience: string;
  };
  mapEmbedUrl?: string;
  mapImageUrl?: string;
}

export default function MapSection({
  title = "Visit Our Campus",
  subtitle = "We're located in the heart of the city, easily accessible by public transport",
  address = {
    line1: "123 Physics Avenue",
    line2: "Science District",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    country: "India",
  },

  hours = {
    weekday: "9:00 AM - 8:00 PM",
    saturday: "10:00 AM - 6:00 PM",
    sunday: "Closed",
  },

  mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.985287394108!2d77.594562314822!3d12.971598990844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBangalore%20Palace!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin",
  mapImageUrl = "/images/map-placeholder.jpg", // Fallback image if embed fails
}: MapSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Map animation
      gsap.from(mapRef.current, {
        x: -100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });

      // Card animation (with slight delay)
      gsap.from(cardRef.current, {
        x: 100,
        opacity: 0,
        duration: 1.2,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
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
          start: "top 85%",
        },
      });

      // Pulsing dot animation
      gsap.to(".pulse-dot", {
        scale: 1.5,
        opacity: 0,
        duration: 1.5,
        repeat: -1,
        ease: "power2.out",
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
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4 backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Our Location
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {title.split(" ")[0]}{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              {title.split(" ").slice(1).join(" ")}
            </span>
          </h2>

          <p className="text-lg text-gray-400">{subtitle}</p>
        </div>

        {/* Map and Card Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Map Section (Left) */}
          <div
            ref={mapRef}
            className="relative w-full lg:w-3/4 h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Map Embed */}
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />

            {/* Fallback Image (if iframe fails) */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Image
                src={mapImageUrl}
                alt="Map location"
                fill
                className="object-cover opacity-50"
              />
            </div>

            {/* Location Marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="relative">
                <div className="pulse-dot absolute inset-0 bg-blue-500 rounded-full" />
                <div className="relative w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-white/50 shadow-lg" />
              </div>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 to-transparent pointer-events-none" />
          </div>

          {/* Info Card (Right, 40% overlap) */}
          <div
            ref={cardRef}
            className="relative lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 w-full lg:w-2/5 mt-6 lg:mt-0 z-30"
          >
            <div className="group relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

              {/* Card */}
              <div className="relative bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-tr-3xl" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Gravity Campus
                    </h3>
                    <p className="text-sm text-gray-400">
                      Main Learning Center
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-8">
                  <div className="flex items-start gap-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                    <div>
                      <p>{address.line1}</p>
                      <p>{address.line2}</p>
                      <p>
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p>{address.country}</p>
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="bg-white/5 rounded-2xl p-4 mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-white">
                      Opening Hours
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monday - Friday</span>
                      <span className="text-white">{hours.weekday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Saturday</span>
                      <span className="text-white">{hours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sunday</span>
                      <span className="text-white">{hours.sunday}</span>
                    </div>
                  </div>
                </div>

                {/* Get Directions Button */}
                <Link
                  href={`https://maps.google.com/?q=${address.line1},${address.city},${address.state}`}
                  target="_blank"
                  className="group/btn relative block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Get Directions
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                </Link>

                {/* Note */}
                <p className="text-xs text-center text-gray-600 mt-4">
                  <Sparkles className="w-3 h-3 inline-block mr-1 text-yellow-400" />
                  Free parking available for students
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Locations */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            <span className="text-blue-400">📍</span> Nearby: Indiranagar Metro
            (5 min) • CMH Road (2 min) • 100ft Road (3 min)
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .pulse-dot {
          animation: pulse 2s ease-out infinite;
        }
      `}</style>
    </section>
  );
}
