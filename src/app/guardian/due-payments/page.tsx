"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetPaymentsQuery } from "@/store/api/paymentApi";

const DuePaymentsPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();

  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetPaymentsQuery({ status: "OVERDUE", page: 1, limit: 50 });

  const payments = Array.isArray(paymentsData)
    ? paymentsData
    : paymentsData?.data || [];

  const loading = userLoading || paymentsLoading;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <p className="text-gray-400 text-center">Please login to view due payments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Due / Overdue Payments</h1>

      {payments.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="text-center">
            <p className="text-green-400 font-medium text-lg">
              All payments are up to date!
            </p>
            <p className="text-gray-400 text-sm mt-1">
              No due or overdue payments.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment: any) => (
            <div
              key={payment.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-red-500/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold">
                    {payment.student?.name || "Unknown Student"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {payment.enrollment?.batch?.name || "N/A"} -{" "}
                    {payment.enrollment?.batch?.subject || ""}
                  </p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                  OVERDUE
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Amount Due</p>
                  <p className="text-white font-semibold">
                    ${(payment.dueAmount || payment.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Paid</p>
                  <p className="text-green-400 font-semibold">
                    ${(payment.paidAmount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Due Date</p>
                  <p className="text-red-400 font-semibold">
                    {payment.dueDate
                      ? new Date(payment.dueDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Method</p>
                  <p className="text-gray-300">{payment.method || "N/A"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DuePaymentsPage;
