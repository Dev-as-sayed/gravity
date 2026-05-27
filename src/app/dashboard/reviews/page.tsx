"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  batchId: string;
  batchName?: string;
  studentName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const ReviewsPage = () => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useState(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/batches?include=reviews");
        const json = await res.json();
        if (json.success) {
          const all: Review[] = [];
          (json.data ?? []).forEach((batch: any) => {
            (batch.reviews ?? []).forEach((r: any) => {
              all.push({
                id: r.id,
                batchId: batch.id,
                batchName: batch.name,
                studentName: r.student?.name ?? "Anonymous",
                rating: r.rating,
                comment: r.comment,
                createdAt: r.createdAt,
              });
            });
          });
          setReviews(all);
        } else {
          setError(json.message ?? "Failed to fetch reviews");
        }
      } catch {
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Batch Reviews</h1>

      {reviews.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 text-center">
          <p className="text-gray-400">No reviews found for your batches.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold">{review.studentName}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    Batch: {review.batchName}
                  </p>
                  {review.comment && (
                    <p className="text-gray-300 text-sm mt-2">{review.comment}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < review.rating ? "text-yellow-400" : "text-gray-600"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
