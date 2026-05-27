"use client";

import { useSession } from "next-auth/react";
import { useUser } from "@/hooks/useUser";
import { useGetPaymentsQuery } from "@/store/api/paymentApi";

const ReceiptsPage = () => {
  const { data: session } = useSession();
  const { user, isLoading: userLoading } = useUser();

  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetPaymentsQuery({
      status: "COMPLETED",
      page: 1,
      limit: 50,
    });

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
        <p className="text-gray-400 text-center">Please login to view receipts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payment Receipts</h1>

      {payments.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <p className="text-gray-400 text-center">
            No completed payments with receipts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment: any) => (
            <div
              key={payment.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">
                    Receipt #{payment.invoiceNumber || payment.id.slice(0, 8)}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(payment.paymentDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  PAID
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Student</p>
                  <p className="text-white">
                    {payment.student?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Amount</p>
                  <p className="text-white font-semibold">
                    ${(payment.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Method</p>
                  <p className="text-gray-300">{payment.method || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-400">Transaction ID</p>
                  <p className="text-gray-300 text-xs truncate">
                    {payment.transactionId || "N/A"}
                  </p>
                </div>
              </div>

              {payment.receiptUrl && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <a
                    href={payment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View Receipt
                  </a>
                </div>
              )}

              {(payment.cardLast4 || payment.upiId || payment.bankName) && (
                <div className="mt-3 pt-3 border-t border-gray-700/50">
                  <p className="text-gray-400 text-xs">
                    {payment.cardBrand && payment.cardLast4
                      ? `${payment.cardBrand} **** ${payment.cardLast4}`
                      : ""}
                    {payment.upiId ? `UPI: ${payment.upiId}` : ""}
                    {payment.bankName ? `Bank: ${payment.bankName}` : ""}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;
