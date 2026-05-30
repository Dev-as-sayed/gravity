"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetQuizByIdQuery, useStartQuizAttemptMutation } from "@/store/api/quizApi";

const QuizDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;

  const { data, isLoading, error } = useGetQuizByIdQuery(id);
  const [startAttempt, { isLoading: starting }] = useStartQuizAttemptMutation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [startError, setStartError] = useState("");

  const quiz = data;

  const handleStart = async () => {
    if (!session?.user?.studentId) {
      setStartError("You must be a student to attempt quizzes");
      return;
    }
    setStartError("");
    try {
      const result = await startAttempt(id).unwrap();
      const attemptId = result.data.attemptId;
      if (attemptId) {
        router.push(`/dashboard/student/quizzes/${id}/attempt/${attemptId}`);
      } else {
        setStartError("Failed to start quiz attempt");
      }
    } catch (err: any) {
      setStartError(err?.data?.message || err?.message || "Failed to start quiz");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Quiz not found or unavailable.</p>
      </div>
    );
  }

  const questionCount = quiz.questions?.length || quiz._count?.questions || 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8">
        <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-400 mb-6">{quiz.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{questionCount}</div>
            <div className="text-xs text-gray-400 mt-1">Questions</div>
          </div>
          {quiz.timeLimit && (
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{quiz.timeLimit}</div>
              <div className="text-xs text-gray-400 mt-1">Minutes</div>
            </div>
          )}
          <div className="bg-gray-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{quiz.totalMarks}</div>
            <div className="text-xs text-gray-400 mt-1">Total Marks</div>
          </div>
          {quiz.passingMarks && (
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{quiz.passingMarks}</div>
              <div className="text-xs text-gray-400 mt-1">Pass Marks</div>
            </div>
          )}
          {quiz.difficulty && (
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold text-white capitalize">{quiz.difficulty.toLowerCase()}</div>
              <div className="text-xs text-gray-400 mt-1">Difficulty</div>
            </div>
          )}
          {quiz.subject && (
            <div className="bg-gray-700/30 rounded-lg p-4 text-center">
              <div className="text-lg font-semibold text-white">{quiz.subject}</div>
              <div className="text-xs text-gray-400 mt-1">Subject</div>
            </div>
          )}
        </div>

        <div className="bg-gray-700/20 rounded-lg p-6 mb-8">
          <h2 className="text-white font-semibold mb-3">Rules & Instructions</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Read each question carefully before answering.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Questions are presented one at a time in sequential order.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Once an answer is submitted, it becomes final and cannot be changed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>You cannot skip questions or return to previous ones.</span>
            </li>
            {quiz.timeLimit && (
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>The quiz has a time limit of <strong>{quiz.timeLimit} minutes</strong>. It will auto-submit when time expires.</span>
              </li>
            )}
            {quiz.negativeMarking > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>There is a negative marking of <strong>{quiz.negativeMarking}</strong> mark(s) for wrong answers.</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">•</span>
              <span>Leaving the quiz screen will terminate your attempt immediately.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-0.5">•</span>
              <span>Do not refresh the page or use the back button during the quiz.</span>
            </li>
          </ul>
        </div>

        {startError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {startError}
          </div>
        )}

        <div className="flex justify-center">
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={starting}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {starting ? "Starting..." : "Start Quiz"}
            </button>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-yellow-400 text-sm">
                Are you sure you want to begin? The quiz will start immediately and cannot be paused.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
                >
                  {starting ? "Starting..." : "Yes, Start Now"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetailPage;
