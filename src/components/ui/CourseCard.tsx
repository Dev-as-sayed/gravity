"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Users,
  BookOpen,
  Atom,
  Zap,
  Sparkles,
  Flame,
} from "lucide-react";
import { Course } from "@/store/api/batchApi";

interface Props {
  course: Course;
}

// Helper function to get physics branch color and icon
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

const CourseCard = ({ course }: Props) => {
  const branchStyle = getPhysicsBranchStyle(course.subject || "");
  const BranchIcon = branchStyle.icon;

  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20">
      {/* Thumbnail */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <BranchIcon
              size={48}
              style={{ color: branchStyle.color, opacity: 0.3 }}
            />
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 text-xs font-medium rounded-full bg-black/70 text-white backdrop-blur-sm">
          {course.level || "Intermediate"}
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground shadow-sm">
          {course.isFree ? "FREE" : `₹${course.price}`}
        </div>

        {/* Physics Branch Indicator */}
        <div
          className="absolute bottom-3 left-3 px-2 py-1 rounded-md text-white text-xs font-medium flex items-center gap-1 backdrop-blur-sm"
          style={{ backgroundColor: branchStyle.color }}
        >
          <BranchIcon size={12} />
          <span>{branchStyle.label}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Subject */}
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: branchStyle.color }}
          />
          <p className="text-sm text-muted-foreground">
            {course.subject || "Physics"}
          </p>
        </div>

        {/* Teacher */}
        {course.teacher && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen size={14} />
            <span>{course.teacher.name}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{course.totalStudents?.toLocaleString() || 0} students</span>
          </div>

          <div className="flex items-center gap-1">
            <Star size={14} className="text-warning fill-current" />
            <span>{course.averageRating?.toFixed(1) || "0.0"}</span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/course/${course.id}`}
          className="block w-full text-center mt-3 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium hover:opacity-90 hover:shadow-md transition-all duration-300"
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
