"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useGetAttemptDetailsQuery } from "@/store/api/quizApi";

const QuizResultPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const attemptId = params.attemptId as string;
  const abandoned = searchParams.get("abandoned") === "true";

  const { data, isLoading, error } = useGetAttemptDetailsQuery(
    { quizId: id, attemptId },
    { refetchOnMountOrArgChange: true, pollingInterval: 3000 },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Failed to load results.</p>
      </div>
    );
  }

  const attempt = (data as any)?.data;
  if (!attempt) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Result not found.</p>
      </div>
    );
  }

  const score = attempt.score ?? 0;
  const percentage = attempt.percentage ?? 0;
  const isPassed = attempt.isPassed ?? percentage >= (attempt.quiz?.passingMarks ? (attempt.quiz.passingMarks / attempt.quiz.totalMarks) * 100 : 0);
  const totalMarks = attempt.quiz?.totalMarks ?? 0;
  const questions = attempt.quiz?.questions || [];
  const answers = attempt.answers || [];
  const answeredCount = Array.isArray(answers) ? answers.length : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Status Banner */}
      <div className={`rounded-xl p-6 mb-6 border ${
        abandoned
          ? "bg-yellow-500/10 border-yellow-500/30"
          : isPassed
            ? "bg-green-500/10 border-green-500/30"
            : "bg-red-500/10 border-red-500/30"
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
            abandoned
              ? "bg-yellow-500/20"
              : isPassed
                ? "bg-green-500/20"
                : "bg-red-500/20"
          }`}>
            {abandoned ? "⚠️" : isPassed ? "🎉" : "😞"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {abandoned ? "Quiz Abandoned" : isPassed ? "Congratulations!" : "Better Luck Next Time"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {abandoned
                ? "The quiz was terminated because you left the screen."
                : isPassed
                  ? "You passed the quiz!"
                  : "You did not pass this quiz."}
            </p>
          </div>
        </div>
      </div>

      {/* Score Card */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${isPassed ? "text-green-400" : "text-red-400"}`}>
              {score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400 mt-1">Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400 mt-1">Percentage</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{totalMarks}</div>
            <div className="text-xs text-gray-400 mt-1">Total Marks</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {answeredCount}/{questions.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">Answered</div>
          </div>
        </div>
      </div>

      {/* Answers Review */}
      {attempt.quiz?.showResult && attempt.quiz?.showAnswer && questions.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Answer Review</h2>
          <div className="space-y-4">
            {questions.map((question: any, index: number) => {
              const studentAnswer = Array.isArray(answers)
                ? answers.find((a: any) => a.questionId === question.id)
                : null;

              return (
                <div
                  key={question.id}
                  className="bg-gray-700/20 rounded-lg p-4 border border-gray-700/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm font-medium text-gray-400 mt-0.5">
                      Q{index + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="text-white text-sm mb-2">{question.text}</p>
                      <div className="flex items-center gap-3 text-xs">
                        {studentAnswer ? (
                          <span className="text-blue-400">
                            Your answer: {studentAnswer.selectedOption || "N/A"}
                          </span>
                        ) : (
                          <span className="text-yellow-400">Not answered</span>
                        )}
                        {question.correctAnswer && (
                          <span className="text-green-400">
                            Correct: {String(question.correctAnswer)}
                          </span>
                        )}
                      </div>
                      {question.explanation && (
                        <p className="text-gray-500 text-xs mt-2 italic">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => router.push("/dashboard/student/quizzes")}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
        >
          Back to Quizzes
        </button>
        <button
          onClick={() => router.push("/dashboard/student")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default QuizResultPage;
