// app/courses/[slug]/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  Star,
  Users,
  BookOpen,
  Clock,
  Award,
  Target,
  ListChecks,
  ChevronRight,
  Calendar,
  Monitor,
  MapPin,
  Wifi,
  Loader2,
  CheckCircle,
  GraduationCap,
  Zap,
  Sparkles,
  Flame,
  Atom,
  PlayCircle,
  FileText,
  ChevronDown,
} from "lucide-react";
import {
  useGetBatchesQuery,
  useGetCourseByIdQuery,
} from "@/store/api/batchApi";

// Helper function for physics branch color
const getPhysicsBranchStyle = (subject: string) => {
  const subjectLower = subject.toLowerCase();
  if (subjectLower.includes("mechanic") || subjectLower.includes("classical")) {
    return {
      color: "var(--physics-mechanics)",
      icon: Atom,
      label: "Mechanics",
    };
  }
  if (
    subjectLower.includes("electromagnetism") ||
    subjectLower.includes("electric")
  ) {
    return {
      color: "var(--physics-electromagnetism)",
      icon: Zap,
      label: "Electromagnetism",
    };
  }
  if (subjectLower.includes("quantum")) {
    return {
      color: "var(--physics-quantum)",
      icon: Sparkles,
      label: "Quantum",
    };
  }
  if (subjectLower.includes("thermodynamic")) {
    return {
      color: "var(--physics-thermodynamics)",
      icon: Flame,
      label: "Thermodynamics",
    };
  }
  return { color: "var(--primary)", icon: Atom, label: "Physics" };
};

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "batches" | "reviews"
  >("overview");

  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourseByIdQuery(slug);
  const { data: batchesData, isLoading: batchesLoading } = useGetBatchesQuery({
    courseId: courseData?.id,
    enrollmentOpen: true,
    isActive: true,
    limit: 10,
  });

  console.log("Course Data:", courseData);

  const course = courseData;
  const batches = batchesData?.data || [];
  const branchStyle = getPhysicsBranchStyle(course?.subject || "");

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto">
            <Atom className="w-6 h-6 text-error" />
          </div>
          <p className="text-error">Course not found</p>
          <button
            onClick={() => router.push("/courses")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const levelColors = {
    BEGINNER: "bg-success/10 text-success",
    INTERMEDIATE: "bg-info/10 text-info",
    ADVANCED: "bg-warning/10 text-warning",
    EXPERT: "bg-error/10 text-error",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Thumbnail */}
            <div className="lg:w-2/5">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/10 to-secondary/10">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <branchStyle.icon
                      size={64}
                      style={{ color: branchStyle.color, opacity: 0.3 }}
                    />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-black/70 text-white backdrop-blur-sm">
                    {course.level}
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                    {course.isFree ? "FREE" : `₹${course.price}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="lg:w-3/5 space-y-4">
              {/* Physics Branch Badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: branchStyle.color }}
              >
                <branchStyle.icon size={14} />
                <span>{branchStyle.label}</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-card-foreground">
                {course.title}
              </h1>

              <p className="text-lg text-muted-foreground">
                {course.description ||
                  "Explore the fascinating world of physics with this comprehensive course."}
              </p>

              {/* Teacher Info */}
              {course.teacher && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                    {course.teacher.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-semibold text-card-foreground">
                      {course.teacher.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users size={18} />
                  <span>
                    {course.totalStudents?.toLocaleString() || 0} students
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star size={18} className="text-warning fill-current" />
                  <span>
                    {course.averageRating?.toFixed(1) || "0.0"} (
                    {course.totalReviews || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={18} />
                  <span>{course.duration || 40} hours</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen size={18} />
                  <span>{course.totalBatches || 0} batches</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {["overview", "curriculum", "batches", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-card-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="physics-card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-primary" />
                  About This Course
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {course.description ||
                    "This course provides a comprehensive understanding of physics principles and their applications. Students will develop critical thinking skills and gain hands-on experience through practical examples and problem-solving sessions."}
                </p>
              </div>

              {/* Learning Outcomes */}
              <div className="physics-card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target size={20} className="text-primary" />
                  What You'll Learn
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {(course.learningOutcomes?.length
                    ? course.learningOutcomes
                    : [
                        "Master fundamental physics concepts and principles",
                        "Develop problem-solving skills for complex scenarios",
                        "Apply theoretical knowledge to real-world applications",
                        "Prepare for advanced physics studies and research",
                        "Build a strong foundation for competitive exams",
                      ]
                  ).map((outcome, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle
                        size={16}
                        className="text-success mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm text-muted-foreground">
                        {outcome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div className="physics-card">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <ListChecks size={20} className="text-primary" />
                  Prerequisites
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(course.prerequisites?.length
                    ? course.prerequisites
                    : [
                        "Basic understanding of mathematics",
                        "Interest in physics concepts",
                        "High school level science knowledge",
                      ]
                  ).map((prereq, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Course Features */}
              <div className="physics-card">
                <h3 className="font-semibold mb-3">Course Features</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Level</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${levelColors[course.level]}`}
                    >
                      {course.level}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {course.duration || 40} hours
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Batches</span>
                    <span className="font-medium">
                      {course.totalBatches || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Students
                    </span>
                    <span className="font-medium">
                      {course.totalStudents?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">English</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setActiveTab("batches")}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all"
              >
                Enroll Now
              </button>
            </div>
          </div>
        )}

        {/* Batches Tab */}
        {activeTab === "batches" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Available Batches</h2>
              <p className="text-sm text-muted-foreground">
                {batches.length} batches found
              </p>
            </div>

            {batchesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : batches.length === 0 ? (
              <div className="text-center py-12 physics-card">
                <GraduationCap
                  size={48}
                  className="text-muted-foreground mx-auto mb-3"
                />
                <p className="text-muted-foreground">
                  No active batches available at the moment
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check back later for new batches
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {batches.map((batch) => (
                  <BatchCard key={batch.id} batch={batch} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Curriculum Tab */}
        {activeTab === "curriculum" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="physics-card">
              <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>
              <div className="space-y-3">
                {[
                  {
                    title: "Introduction to Physics",
                    duration: "2 hours",
                    topics: 4,
                  },
                  {
                    title: "Classical Mechanics",
                    duration: "8 hours",
                    topics: 12,
                  },
                  {
                    title: "Electromagnetism",
                    duration: "10 hours",
                    topics: 15,
                  },
                  { title: "Thermodynamics", duration: "6 hours", topics: 8 },
                  { title: "Quantum Physics", duration: "8 hours", topics: 10 },
                  { title: "Final Assessment", duration: "2 hours", topics: 1 },
                ].map((module, index) => (
                  <div
                    key={index}
                    className="border-b border-border last:border-0 pb-3 last:pb-0"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-semibold">
                          Module {index + 1}
                        </span>
                        <h3 className="font-medium">{module.title}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{module.duration}</span>
                        <span>{module.topics} topics</span>
                        <ChevronDown size={16} className="cursor-pointer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Rating Summary */}
            <div className="physics-card text-center">
              <div className="inline-flex items-center gap-2 mb-2">
                <Star size={32} className="text-warning fill-current" />
                <span className="text-4xl font-bold">
                  {course.averageRating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <p className="text-muted-foreground">
                Based on {course.totalReviews || 0} reviews
              </p>
              <div className="flex justify-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={
                      star <= (course.averageRating || 0)
                        ? "text-warning fill-current"
                        : "text-muted"
                    }
                  />
                ))}
              </div>
            </div>

            {/* No Reviews Message */}
            <div className="text-center py-12 physics-card">
              <MessageCircle
                size={48}
                className="text-muted-foreground mx-auto mb-3"
              />
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to review this course
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Batch Card Component for Batches Tab
const BatchCard = ({ batch }: { batch: any }) => {
  const router = useRouter();
  const startDate = new Date(batch.startDate);
  const isUpcoming = new Date(batch.startDate) > new Date();
  const isOngoing =
    new Date(batch.startDate) <= new Date() &&
    (!batch.endDate || new Date(batch.endDate) >= new Date());

  const modeIcons = {
    ONLINE: <Monitor size={16} />,
    OFFLINE: <MapPin size={16} />,
    HYBRID: <Wifi size={16} />,
  };

  return (
    <div className="physics-card hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg">{batch.name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isUpcoming
                  ? "bg-info/10 text-info"
                  : isOngoing
                    ? "bg-success/10 text-success"
                    : "bg-muted-foreground/10 text-muted-foreground"
              }`}
            >
              {isUpcoming ? "Upcoming" : isOngoing ? "Ongoing" : "Completed"}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {modeIcons[batch.mode as keyof typeof modeIcons] || (
                <Monitor size={16} />
              )}
              <span>{batch.mode}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Starts {startDate.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>
                {batch.currentEnrollments} / {batch.maxStudents || "∞"} enrolled
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {batch.description ||
              "Join this batch to master physics concepts with expert guidance."}
          </p>
        </div>

        <div className="text-right space-y-2">
          <div>
            {batch.offerPrice ? (
              <>
                <span className="text-2xl font-bold text-primary">
                  ₹{batch.offerPrice}
                </span>
                <span className="text-sm text-muted-foreground line-through ml-2">
                  ₹{batch.price}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-primary">
                ₹{batch.price}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push(`/batches/${batch.slug || batch.id}`)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View Batch
          </button>
        </div>
      </div>
    </div>
  );
};

// Missing icon import
const MessageCircle = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

export default CourseDetailPage;
