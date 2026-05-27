import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-bold text-white">404</h2>
        <p className="text-gray-400">Dashboard page not found</p>
        <Link
          href="/dashboard"
          className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
