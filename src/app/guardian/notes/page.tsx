"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
}

interface Note {
  id: string;
  content: string;
  teacherName?: string;
  subject?: string;
  createdAt: string;
  studentId: string;
}

const NotesPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();
  const guardianId = user?.guardianId;

  const [students, setStudents] = useState<Student[]>([]);
  const [notesMap, setNotesMap] = useState<Record<string, Note[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guardianId) {
      setLoading(false);
      return;
    }
    fetch(`/api/students?guardianId=${guardianId}`)
      .then((r) => r.json())
      .then(async (res) => {
        if (!res.success) return;
        const studentList: Student[] = res.data;
        setStudents(studentList);

        const map: Record<string, Note[]> = {};
        await Promise.all(
          studentList.map(async (s) => {
            try {
              const nRes = await fetch(`/api/notes?studentId=${s.id}`);
              const nData = await nRes.json();
              if (nData.success) map[s.id] = nData.data;
            } catch {}
          }),
        );
        setNotesMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [guardianId]);

  if (userLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to view notes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Teacher Notes</h1>

      {students.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">No children linked to your account.</p>
        </div>
      ) : (
        students.map((student) => {
          const notes = notesMap[student.id] || [];
          return (
            <div
              key={student.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                {student.name}
              </h2>

              {notes.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No teacher notes for this student.
                </p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-700/30 rounded-lg p-4"
                    >
                      <p className="text-gray-200 text-sm mb-2">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {note.teacherName
                            ? `by ${note.teacherName}`
                            : ""}
                          {note.subject ? ` (${note.subject})` : ""}
                        </span>
                        <span>
                          {new Date(note.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotesPage;
