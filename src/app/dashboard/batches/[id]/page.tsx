"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  useGetBatchByIdQuery,
  useGetBatchEnrollmentsQuery,
} from "@/store/api/batchApi";
import Image from "next/image";

const BatchDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [selectedSessionIdx, setSelectedSessionIdx] = useState<number | null>(null);

  const { data: batch, isLoading, error } = useGetBatchByIdQuery(id);
  const { data: enrollments } = useGetBatchEnrollmentsQuery(id, {
    skip: selectedSessionIdx === null,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Failed to load batch.</p>
        <button
          onClick={() => router.back()}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const sessions = batch.sessions || [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/batches"
          className="text-gray-400 hover:text-white transition"
        >
          &larr; Batches
        </Link>
        <h1 className="text-2xl font-bold text-white">{batch.name}</h1>
      </div>

      {/* Batch Info */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Subject</span>
            <p className="text-white font-medium mt-1">{batch.subject}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Mode</span>
            <p className="text-white font-medium mt-1">{batch.mode}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Students</span>
            <p className="text-white font-medium mt-1">{batch.currentEnrollments}/{batch.maxStudents || "∞"}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Status</span>
            <p className="mt-1">
              <span className={`px-2 py-1 rounded text-xs ${batch.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {batch.isActive ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
          {batch.teacher && (
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                {batch.teacher.profileImage ? (
                  <Image
                    src={batch.teacher.profileImage}
                    alt={batch.teacher.name}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {batch.teacher.name?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{batch.teacher.name}</p>
                {batch.teacher.qualification && (
                  <p className="text-gray-400 text-xs">{batch.teacher.qualification}</p>
                )}
              </div>
            </div>
          )}
          {batch.price > 0 && (
            <div>
              <span className="text-gray-400 text-xs uppercase tracking-wide">Price</span>
              <p className="text-white font-medium mt-1">₹{batch.price.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">Sessions</h2>
            {sessions.length === 0 ? (
              <p className="text-gray-400 text-sm">No sessions configured.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSessionIdx(selectedSessionIdx === idx ? null : idx)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedSessionIdx === idx
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-300"
                        : "bg-gray-700/30 border-gray-600/30 text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs mt-1 text-gray-400">
                      {s.startTime} - {s.endTime}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.days.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400"
                        >
                          {d.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Students in Selected Session */}
        <div className="lg:col-span-2">
          {selectedSessionIdx === null ? (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 flex items-center justify-center h-48">
              <p className="text-gray-400 text-sm">Select a session to view enrolled students.</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-1">
                {sessions[selectedSessionIdx]?.name} - Students
              </h2>
              <p className="text-gray-400 text-xs mb-4">
                {sessions[selectedSessionIdx]?.startTime} - {sessions[selectedSessionIdx]?.endTime} &middot;{" "}
                {sessions[selectedSessionIdx]?.days
                  .map((d) => d.charAt(0).toUpperCase() + d.slice(1, 3))
                  .join(", ")}{" "}
                &middot; {enrollments?.length || 0} enrolled
              </p>

              {(!enrollments || enrollments.length === 0) ? (
                <p className="text-gray-400 text-sm py-8 text-center">No students enrolled in this batch.</p>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((enr) => (
                    <div
                      key={enr.id}
                      className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3 border border-gray-600/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                          {enr.student?.profileImage ? (
                            <Image
                              src={enr.student.profileImage}
                              alt={enr.student.name}
                              width={36}
                              height={36}
                              className="object-cover"
                            />
                          ) : (
                            enr.student?.name?.charAt(0) || "?"
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{enr.student?.name}</p>
                          <p className="text-gray-400 text-xs">
                            Status: <span className={`${enr.status === "APPROVED" || enr.status === "COMPLETED" ? "text-green-400" : enr.status === "PENDING" ? "text-yellow-400" : "text-red-400"}`}>{enr.status}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <p>Score: {enr.averageScore?.toFixed(0) || "N/A"}</p>
                        <p>Attended: {enr.classesAttended}/{enr.totalClasses}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchDetailPage;
