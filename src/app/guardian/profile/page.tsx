"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface GuardianProfile {
  id: string;
  name: string;
  relationship?: string;
  occupation?: string;
  user: {
    email: string;
    phone: string;
    alternatePhone?: string | null;
  };
}

const ProfilePage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();

  const [profile, setProfile] = useState<GuardianProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetch(`/api/guardians/${user.id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setProfile(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

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
        <p className="text-gray-400 text-center">Please login to view profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-2xl">
            {(profile?.name || session.user?.name || "G")
              .charAt(0)
              .toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {profile?.name || session.user?.name || "Guardian"}
            </h2>
            <p className="text-gray-400">Guardian</p>
          </div>
        </div>

        {profile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Email
                </label>
                <p className="text-white bg-gray-700/30 rounded-lg px-4 py-2">
                  {profile.user.email}
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">
                  Phone
                </label>
                <p className="text-white bg-gray-700/30 rounded-lg px-4 py-2">
                  {profile.user.phone}
                </p>
              </div>
              {profile.user.alternatePhone && (
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Alternate Phone
                  </label>
                  <p className="text-white bg-gray-700/30 rounded-lg px-4 py-2">
                    {profile.user.alternatePhone}
                  </p>
                </div>
              )}
              {profile.relationship && (
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Relationship
                  </label>
                  <p className="text-white bg-gray-700/30 rounded-lg px-4 py-2">
                    {profile.relationship}
                  </p>
                </div>
              )}
              {profile.occupation && (
                <div>
                  <label className="text-gray-400 text-sm block mb-1">
                    Occupation
                  </label>
                  <p className="text-white bg-gray-700/30 rounded-lg px-4 py-2">
                    {profile.occupation}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            Profile data not available.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
