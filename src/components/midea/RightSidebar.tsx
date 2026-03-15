// src/components/media/RightSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  PlayCircle,
  Headphones,
  Image,
  Eye,
  Sparkles,
  Rocket,
  Target,
  BookOpen,
  Video,
  Globe,
  Zap,
  Award,
  Users,
  MessageCircle,
  ThumbsUp,
  Share2,
  Bookmark,
  Download,
} from "lucide-react";

// Data
const announcements = [
  {
    id: 1,
    title: "New Quantum Mechanics Course",
    content:
      "Enroll now for the advanced quantum mechanics batch starting June 15th",
    date: "2024-06-01",
    icon: Rocket,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    id: 2,
    title: "Weekly Test Schedule",
    content: "Weekly tests will be held every Saturday at 10 AM IST",
    date: "2024-06-05",
    icon: Target,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    id: 3,
    title: "New Study Material Added",
    content: "Practice problems for electromagnetism now available",
    date: "2024-06-03",
    icon: BookOpen,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: 4,
    title: "Upcoming Live Session",
    content: "Dr. Arjun Sharma will host a live Q&A session on relativity",
    date: "2024-06-07",
    icon: Video,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Quantum Mechanics Live",
    date: "June 15, 2024",
    time: "10:00 AM",
    instructor: "Dr. Arjun Sharma",
  },
  {
    id: 2,
    title: "Electromagnetism Workshop",
    date: "June 18, 2024",
    time: "2:00 PM",
    instructor: "Prof. Neha Gupta",
  },
  {
    id: 3,
    title: "Relativity Seminar",
    date: "June 20, 2024",
    time: "11:00 AM",
    instructor: "Dr. Rahul Verma",
  },
  {
    id: 4,
    title: "Particle Physics Discussion",
    date: "June 22, 2024",
    time: "3:00 PM",
    instructor: "Prof. Priya Singh",
  },
];

const trendingMedia = [
  {
    id: 1,
    title: "Quantum Entanglement",
    views: "45K",
    trend: "+12%",
    icon: Zap,
  },
  {
    id: 2,
    title: "Black Holes Explained",
    views: "38K",
    trend: "+8%",
    icon: Globe,
  },
  {
    id: 3,
    title: "String Theory Basics",
    views: "32K",
    trend: "+15%",
    icon: Sparkles,
  },
  { id: 4, title: "Nuclear Fusion", views: "28K", trend: "+5%", icon: Target },
];

const latestMedia = [
  {
    id: 1,
    title: "Quantum Entanglement Explained",
    type: "video",
    duration: "15:30",
    views: "12K",
    date: "2 hours ago",
  },
  {
    id: 2,
    title: "Maxwell's Equations - Full Lecture",
    type: "video",
    duration: "45:20",
    views: "8.5K",
    date: "5 hours ago",
  },
  {
    id: 3,
    title: "Special Relativity Podcast",
    type: "audio",
    duration: "32:15",
    views: "3.2K",
    date: "1 day ago",
  },
  {
    id: 4,
    title: "Particle Physics Infographic",
    type: "image",
    views: "5.7K",
    date: "2 days ago",
  },
];

const RightSidebar = () => {
  return (
    <aside className="hidden xl:block w-80 border-l border-white/10 bg-gray-900/50 p-6 overflow-y-auto">
      {/* Important Announcements */}
      <AnnouncementsSection announcements={announcements} />

      {/* Upcoming Events */}
      <EventsSection events={upcomingEvents} />

      {/* Trending Media */}
      <TrendingSection trending={trendingMedia} />

      {/* Latest Media */}
      <LatestMediaSection latest={latestMedia} />

      {/* Advertisement Space */}
      <AdvertisementSection />
    </aside>
  );
};

// Sub-components
const AnnouncementsSection = ({ announcements }: { announcements: any[] }) => (
  <div className="mb-8">
    <SectionHeader
      icon={Bell}
      title="Important Announcements"
      color="text-yellow-400"
    />
    <div className="space-y-3">
      {announcements.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`p-4 rounded-xl border ${item.borderColor} ${item.bgColor} hover:scale-[1.02] transition-transform cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 mb-2">{item.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const EventsSection = ({ events }: { events: any[] }) => (
  <div className="mb-8">
    <SectionHeader
      icon={Calendar}
      title="Upcoming Events"
      color="text-green-400"
    />
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  </div>
);

const EventCard = ({ event }: { event: any }) => (
  <div className="p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer">
    <h3 className="font-medium text-white text-sm mb-1">{event.title}</h3>
    <p className="text-xs text-gray-400 mb-2">{event.instructor}</p>
    <div className="flex items-center gap-3 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        {event.date}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {event.time}
      </span>
    </div>
  </div>
);

const TrendingSection = ({ trending }: { trending: any[] }) => (
  <div className="mb-8">
    <SectionHeader
      icon={TrendingUp}
      title="Trending Now"
      color="text-purple-400"
    />
    <div className="space-y-3">
      {trending.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Icon className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white">{item.title}</p>
                <p className="text-xs text-gray-500">{item.views} views</p>
              </div>
            </div>
            <span className="text-xs text-green-400">{item.trend}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const LatestMediaSection = ({ latest }: { latest: any[] }) => (
  <div className="mb-8">
    <SectionHeader icon={Clock} title="Latest Uploads" color="text-blue-400" />
    <div className="space-y-3">
      {latest.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  </div>
);

const MediaCard = ({ item }: { item: any }) => {
  const getIcon = () => {
    switch (item.type) {
      case "video":
        return <PlayCircle className="w-5 h-5 text-white" />;
      case "audio":
        return <Headphones className="w-5 h-5 text-white" />;
      case "image":
        return <Image className="w-5 h-5 text-white" />;
      default:
        return <PlayCircle className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="flex gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer group">
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate group-hover:text-blue-400 transition-colors">
          {item.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {item.views}
          </span>
          <span>•</span>
          <span>{item.date}</span>
        </div>
      </div>
    </div>
  );
};

const AdvertisementSection = () => (
  <div className="mt-8 p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
    <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
      <Sparkles className="w-4 h-4" />
      Sponsored
    </h3>
    <div className="aspect-video bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
      <span className="text-xs text-gray-500">Ad Space</span>
    </div>
    <p className="text-xs text-gray-400">
      Master Quantum Mechanics with our comprehensive course
    </p>
    <button className="mt-3 w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
      Learn More
    </button>
  </div>
);

// Helper component for section headers
const SectionHeader = ({
  icon: Icon,
  title,
  color,
}: {
  icon: any;
  title: string;
  color: string;
}) => (
  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
    <Icon className={`w-5 h-5 ${color}`} />
    {title}
  </h2>
);

export default RightSidebar;
