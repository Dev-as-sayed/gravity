"use client";

export default function GuardianError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-3 max-w-md">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400 text-sm">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
