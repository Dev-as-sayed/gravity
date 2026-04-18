"use client";

import CourseCard from "@/components/ui/CourseCard";
import { useGetCoursesQuery } from "@/store/api/batchApi";
import { Loader2, Atom, Filter } from "lucide-react";
import { useState } from "react";

const CoursePage = () => {
  const { data, isLoading, error } = useGetCoursesQuery({ page: 1, limit: 12 });
  const [filterBranch, setFilterBranch] = useState<string>("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto">
            <Atom className="w-6 h-6 text-error" />
          </div>
          <p className="text-error">Failed to load courses</p>
        </div>
      </div>
    );
  }

  const courses = data?.data || [];

  const filterOptions = [
    { value: "all", label: "All Physics", color: "var(--primary)" },
    {
      value: "mechanics",
      label: "Classical Mechanics",
      color: "var(--physics-mechanics)",
    },
    {
      value: "electromagnetism",
      label: "Electromagnetism",
      color: "var(--physics-electromagnetism)",
    },
    {
      value: "quantum",
      label: "Quantum Physics",
      color: "var(--physics-quantum)",
    },
    {
      value: "thermodynamics",
      label: "Thermodynamics",
      color: "var(--physics-thermodynamics)",
    },
  ];

  const filteredCourses =
    filterBranch === "all"
      ? courses
      : courses.filter((course) => {
          const subject = (course.subject || "").toLowerCase();
          switch (filterBranch) {
            case "mechanics":
              return (
                subject.includes("mechanic") || subject.includes("classical")
              );
            case "electromagnetism":
              return (
                subject.includes("electromagnetism") ||
                subject.includes("electric")
              );
            case "quantum":
              return subject.includes("quantum");
            case "thermodynamics":
              return subject.includes("thermodynamic");
            default:
              return true;
          }
        });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-4">
          <Atom size={14} />
          <span>Physics Courses</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mb-3">
          Explore Physics{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Education
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover comprehensive physics courses taught by expert educators
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <Filter size={16} className="text-muted-foreground" />
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterBranch(option.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filterBranch === option.value
                ? "text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            style={
              filterBranch === option.value
                ? { backgroundColor: option.color }
                : undefined
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No courses found in this category
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {courses.length > 0 && (
        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      )}
    </div>
  );
};

export default CoursePage;
