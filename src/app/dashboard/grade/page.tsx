"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Assignment {
  id: string;
  title: string;
  description?: string;
  batchId: string;
  studentId: string;
  studentName?: string;
  subject: string;
  maxMarks: number;
  obtainedMarks?: number;
  status: string;
  submittedAt: string;
  gradedAt?: string;
}

const GradePage = () => {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch("/api/assignments");
        const json = await res.json();
        if (json.success) {
          setAssignments(json.data ?? []);
        } else {
          setError(json.message ?? "Failed to fetch assignments");
        }
      } catch {
        setError("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Grade Assignments</h1>

      {assignments.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No assignments pending for grading.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{a.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {a.description ?? "No description"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>Student: {a.studentName ?? "N/A"}</span>
                    <span>Subject: {a.subject}</span>
                    <span>Max Marks: {a.maxMarks}</span>
                    <span>Status: {a.status}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    a.status === "SUBMITTED"
                      ? "bg-yellow-600 text-white"
                      : a.status === "GRADED"
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradePage;
