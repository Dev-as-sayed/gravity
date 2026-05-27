"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

interface Invoice {
  id: string;
  invoiceNumber?: string;
  amount: number;
  paidAmount: number;
  status: string;
  paymentDate: string;
  method: string;
  receiptUrl?: string;
  batch?: { name: string; subject: string };
}

const Page = () => {
  const { user, isLoading, isAuthenticated } = useUser();
  const studentId = user?.studentId;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/payments?studentId=${studentId}`)
      .then((r) => r.json())
      .then((res) => setInvoices(res?.data ?? []))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (isLoading) return null;
  if (!isAuthenticated) return <div>Please login</div>;

  if (loading) return <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;

  const completed = invoices.filter((i) => i.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Invoices</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-3xl font-bold text-white mt-1">{invoices.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{completed.length}</p>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-gray-400">No invoices available.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium">{inv.invoiceNumber || `#${inv.id.slice(0, 8)}`}</p>
                    <p className="text-sm text-gray-400">₹{inv.amount.toLocaleString()} &middot; {new Date(inv.paymentDate).toLocaleDateString()}</p>
                    {inv.batch?.name && <p className="text-xs text-gray-500">{inv.batch.name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      inv.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                      inv.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-gray-500/20 text-gray-400"
                    }`}>{inv.status}</span>
                    {inv.receiptUrl && (
                      <a href={inv.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">Receipt</a>
                    )}
                  </div>
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
