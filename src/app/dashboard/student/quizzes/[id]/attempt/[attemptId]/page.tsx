"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGetAttemptDetailsQuery, useSubmitQuizAttemptMutation } from "@/store/api/quizApi";

interface Answer {
  questionId: string;
  selectedOption?: string;
  selectedValue?: string;
  matchedPairs?: Record<string, string>;
  text?: string;
}

const QuizAttemptPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;
  const attemptId = params.attemptId as string;

  const { data: attemptData, isLoading, error } = useGetAttemptDetailsQuery(
    { quizId: id, attemptId },
    { refetchOnMountOrArgChange: true },
  );
  const [submitQuiz, { isLoading: submitting }] = useSubmitQuizAttemptMutation();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const answersRef = useRef(answers);
  const selectedOptionRef = useRef(selectedOption);
  const currentIndexRef = useRef(currentQuestionIndex);
  const endTimerRef = useRef(false);
  const violationsRef = useRef(violationCount);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  useEffect(() => {
    currentIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    violationsRef.current = violationCount;
  }, [violationCount]);

  const attempt = (attemptData as any)?.data;
  const questions = attempt?.quiz?.questions || [];
  const totalQuestions = questions.length;
  const timeLimit = attempt?.quiz?.timeLimit;

  const saveAnswersToServer = useCallback(async (currentAnswers: Answer[]) => {
    try {
      await fetch(`/api/quizzes/${id}/attempt/${attemptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: currentAnswers }),
      });
    } catch { /* silent */ }
  }, [id, attemptId]);

  const submitFinal = useCallback(async (finalAnswers: Answer[], abandoned = false) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    endTimerRef.current = true;

    try {
      await submitQuiz({
        quizId: id,
        attemptId,
        data: { answers: finalAnswers },
      }).unwrap();
      router.replace(`/dashboard/student/quizzes/${id}/result/${attemptId}?abandoned=${abandoned}`);
    } catch (err: any) {
      const msg = err?.data?.message || "Submission failed";
      setShowExitWarning(true);
    }
  }, [id, attemptId, submitQuiz, router]);

  // Initialize timer
  useEffect(() => {
    if (timeLimit && !attempt?.isCompleted) {
      const endTime = Date.now() + timeLimit * 60 * 1000;
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          submitFinal(answersRef.current);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLimit, attempt?.isCompleted, submitFinal]);

  // Focus lock: detect tab switches, blur, visibility change
  useEffect(() => {
    if (attempt?.isCompleted || quizEnded) return;

    const handleVisibility = () => {
      if (document.hidden) {
        const newCount = violationsRef.current + 1;
        violationsRef.current = newCount;
        setViolationCount(newCount);
        if (newCount >= 3) {
          submitFinal(answersRef.current, true);
        }
      }
    };

    const handleBlur = () => {
      if (!document.hidden) {
        const newCount = violationsRef.current + 1;
        violationsRef.current = newCount;
        setViolationCount(newCount);
        if (newCount >= 3) {
          submitFinal(answersRef.current, true);
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
        saveAnswersToServer(answersRef.current);
        submitFinal(answersRef.current, true);
      }
    };

    const handlePopState = () => {
      if (!hasSubmittedRef.current) {
        submitFinal(answersRef.current, true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    history.pushState(null, "", window.location.href);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [attempt?.isCompleted, quizEnded, submitFinal, saveAnswersToServer]);

  // Disable right-click during quiz
  useEffect(() => {
    if (attempt?.isCompleted) return;
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [attempt?.isCompleted]);

  // If already completed, redirect to result
  useEffect(() => {
    if (attempt?.isCompleted && !hasSubmittedRef.current) {
      router.replace(`/dashboard/student/quizzes/${id}/result/${attemptId}`);
    }
  }, [attempt?.isCompleted, id, attemptId, router]);

  const handleSelectOption = (option: string) => {
    if (isSubmitting || submittingAnswer) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || submittingAnswer || isSubmitting) return;
    setSubmittingAnswer(true);

    const currentQuestion = questions[currentQuestionIndex];
    const answer: Answer = {
      questionId: currentQuestion.id,
      selectedOption,
    };

    const newAnswers = [...answersRef.current, answer];
    setAnswers(newAnswers);
    answersRef.current = newAnswers;

    await saveAnswersToServer(newAnswers);
    setSelectedOption(null);
    setSubmittingAnswer(false);

    if (currentQuestionIndex + 1 >= totalQuestions) {
      setIsSubmitting(true);
      await submitFinal(newAnswers);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Attempt not found.</p>
      </div>
    );
  }

  if (attempt?.isCompleted || quizEnded) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Redirecting to results...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;
  const progressPercent = totalQuestions > 0 ? (currentQuestionIndex / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Violation Warning */}
      {violationCount > 0 && violationCount < 3 && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm text-center">
            Warning {violationCount}/3: Do not leave the quiz screen. Your attempt will be terminated.
          </p>
        </div>
      )}

      {/* Top Bar: Timer + Progress + Question count */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          {timeRemaining !== null && (
            <div className={`text-lg font-mono font-bold ${timeRemaining < 60 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 md:p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                {currentQuestion.type === "MCQ" ? "Multiple Choice" : currentQuestion.type}
              </span>
              <span className="text-xs text-gray-500">
                {currentQuestion.marks} mark{currentQuestion.marks !== 1 ? "s" : ""}
                {currentQuestion.negativeMarks > 0 && (
                  <span className="text-red-400 ml-1">
                    (-{currentQuestion.negativeMarks} for wrong)
                  </span>
                )}
              </span>
            </div>
            <p className="text-white text-lg md:text-xl font-medium leading-relaxed">
              {currentQuestion.text}
            </p>
          </div>

          {/* MCQ Options */}
          {currentQuestion.type === "MCQ" && currentQuestion.options && (
            <div className="space-y-3">
              {(currentQuestion.options as string[]).map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(option)}
                  disabled={isSubmitting || submittingAnswer}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedOption === option
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-gray-700/30 border-gray-600/50 text-gray-300 hover:border-gray-500"
                  } disabled:opacity-60`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedOption === option
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Short Answer / Text Input */}
          {(currentQuestion.type === "SHORT_ANSWER" || currentQuestion.type === "TEXT") && (
            <div>
              <textarea
                value={selectedOption || ""}
                onChange={(e) => setSelectedOption(e.target.value)}
                disabled={isSubmitting || submittingAnswer}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 resize-none h-32 disabled:opacity-60"
                placeholder="Type your answer here..."
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || submittingAnswer || isSubmitting}
              className="px-10 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {submittingAnswer ? "Saving..." : isSubmitting ? "Submitting Quiz..." : "Submit Answer"}
            </button>
          </div>
        </div>
      )}

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-2xl border border-gray-700/50 p-8 max-w-md mx-4 text-center">
            <h2 className="text-xl font-bold text-white mb-3">
              {hasSubmittedRef.current ? "Quiz Submitted" : "Quiz Terminated"}
            </h2>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <p className="text-gray-300 mb-6">
              {hasSubmittedRef.current
                ? "Your quiz has been submitted successfully."
                : "The quiz has been terminated because you left the screen."}
            </p>
            <button
              onClick={() => {
                setShowExitWarning(false);
                if (!hasSubmittedRef.current) {
                  submitFinal(answersRef.current, true);
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {hasSubmittedRef.current ? "View Results" : "View Results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttemptPage;
