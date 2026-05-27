"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetPaymentsQuery } from "@/store/api/paymentApi";

const PaymentsPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();

  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetPaymentsQuery({ page: 1, limit: 50 });

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
        <p className="text-gray-400 text-center">Please login to view payment history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payment History</h1>

      {payments.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">
            No payment history available.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700/50">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Invoice</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Method</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Transaction ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment: any) => (
                <tr
                  key={payment.id}
                  className="border-b border-gray-700/30"
                >
                  <td className="py-3 px-4 text-white">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {payment.invoiceNumber || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-white">
                    ${(payment.amount || 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {payment.method}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.status === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : payment.status === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : payment.status === "FAILED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">
                    {payment.transactionId || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
