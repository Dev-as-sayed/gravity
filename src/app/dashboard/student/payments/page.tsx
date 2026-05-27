"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface PaymentRecord {
  id: string;
  amount: number;
  paidAmount: number;
  method: string;
  status: string;
  transactionId?: string;
  paymentDate: string;
  invoiceNumber?: string;
  batch?: { name: string; subject: string };
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/payments?studentId=${studentId}`)
      .then((r) => r.json())
      .then((res) => setPayments(res?.data ?? []))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payment History</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-white mt-1">{payments.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total Amount</p>
          <p className="text-3xl font-bold text-white mt-1">₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Transactions</h2>
        {payments.length === 0 ? (
          <p className="text-gray-400">No payment history.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">₹{p.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">
                      {p.method} &middot; {new Date(p.paymentDate).toLocaleDateString()}
                      {p.transactionId && <>&middot; ID: {p.transactionId}</>}
                    </p>
                    {p.invoiceNumber && <p className="text-xs text-gray-500 mt-1">Invoice: {p.invoiceNumber}</p>}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    p.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                    p.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                    p.status === "FAILED" ? "bg-red-500/20 text-red-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>{p.status}</span>
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
