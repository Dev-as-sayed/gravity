"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface FeeRecord {
  id: string;
  enrollmentId: string;
  totalFees: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  batch?: { name: string; subject: string };
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/payments?studentId=${studentId}`)
      .then((r) => r.json())
      .then((res) => setFees(res?.data ?? []))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const totalPaid = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalDue = fees.reduce((sum, f) => sum + (f.dueAmount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Fee Details</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total Paid</p>
          <p className="text-3xl font-bold text-white mt-1">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total Due</p>
          <p className="text-3xl font-bold text-red-400 mt-1">₹{totalDue.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Records</p>
          <p className="text-3xl font-bold text-white mt-1">{fees.length}</p>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Fee Records</h2>
        {fees.length === 0 ? (
          <p className="text-gray-400">No fee records found.</p>
        ) : (
          <div className="space-y-3">
            {fees.map((f) => (
              <div key={f.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{f.batch?.name || `Enrollment ${f.enrollmentId}`}</p>
                    <p className="text-sm text-gray-400">Paid: ₹{f.paidAmount.toLocaleString()} &middot; Due: ₹{f.dueAmount.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    f.dueAmount === 0 ? "bg-green-500/20 text-green-400" :
                    f.status === "OVERDUE" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>{f.dueAmount === 0 ? "CLEARED" : f.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
