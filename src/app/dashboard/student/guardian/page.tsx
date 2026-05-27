"use client";

import { useUser } from "@/hooks/useUser";
import { useGetStudentByIdQuery } from "@/store/api/studentApi";

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;

  const { data: student, isLoading: sLoading } = useGetStudentByIdQuery(
    studentId!,
    { skip: !studentId },
  );

  if (isLoading || sLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;
  if (!student) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const guardian = student.guardian;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Guardian Information</h1>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 max-w-2xl">
        {!guardian ? (
          <div>
            <p className="text-gray-400">No guardian assigned.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-xl font-bold">
                {guardian.name?.charAt(0)?.toUpperCase() || "G"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{guardian.name}</h2>
                <p className="text-gray-400">{guardian.relationship}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="text-white">{guardian.user?.email || "--"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Phone</p>
                <p className="text-white">{guardian.user?.phone || "--"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Occupation</p>
                <p className="text-white">{guardian.occupation || "--"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
