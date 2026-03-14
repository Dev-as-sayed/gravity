// src/types/exam.ts
export interface Exam {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  teacherId: string;
  batchId?: string | null;
  type: string;
  subject: string;
  fullMarks: number;
  passMarks?: number | null;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  lateEntryAllowed: boolean;
  earlyExitAllowed: boolean;
  gradingType: string;
  isResultPublished: boolean;
  resultDate?: string | null;
  questionPaper?: string | null;
  answerSheet?: string | null;
  instructions?: string | null;
  allowReview: boolean;
  showRank: boolean;
  showPercentile: boolean;
  allowRecheck: boolean;
  recheckFee?: number | null;
  status:
    | "DRAFT"
    | "SCHEDULED"
    | "ONGOING"
    | "COMPLETED"
    | "RESULT_PUBLISHED"
    | "ARCHIVED"
    | "CANCELLED";
  totalStudents: number;
  appearedCount: number;
  passedCount: number;
  averageMarks: number;
  highestMarks: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  teacher?: {
    id: string;
    name: string;
    qualification?: string | null;
  };
  batch?: {
    id: string;
    name: string;
    subject: string;
  };
  results?: ExamResult[];
  _count?: {
    results: number;
  };
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade?: string | null;
  rank?: number | null;
  percentile?: number | null;
  position?: string | null;
  subjectWiseMarks?: any;
  topicWiseMarks?: any;
  answerScript?: string | null;
  answerScriptUrl?: string | null;
  reviewedBy?: string | null;
  feedback?: string | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
  remarks?: string | null;
  recheckRequested: boolean;
  recheckApproved: boolean;
  recheckResult?: any;
  recheckFee?: number | null;
  recheckPaid: boolean;
  sentToGuardian: boolean;
  guardianSentAt?: string | null;
  certificateId?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  student?: {
    id: string;
    name: string;
    profileImage?: string | null;
    class?: string | null;
    rollNumber?: string | null;
  };
  exam?: {
    title: string;
    subject: string;
    fullMarks: number;
    passMarks?: number | null;
  };
}

export interface ExamFilters {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  type?: string;
  status?: string;
  teacherId?: string;
  batchId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: "examDate" | "title" | "createdAt" | "totalStudents";
  sortOrder?: "asc" | "desc";
}

export interface CreateExamData {
  title: string;
  slug?: string;
  description?: string;
  teacherId?: string;
  batchId?: string;
  type: string;
  subject: string;
  fullMarks: number;
  passMarks?: number;
  examDate: string;
  startTime?: string;
  endTime?: string;
  duration: number;
  lateEntryAllowed?: boolean;
  earlyExitAllowed?: boolean;
  gradingType?: string;
  questionPaper?: string;
  answerSheet?: string;
  instructions?: string;
  allowReview?: boolean;
  showRank?: boolean;
  showPercentile?: boolean;
  allowRecheck?: boolean;
  recheckFee?: number;
  status?: string;
}

export interface UpdateExamData extends Partial<CreateExamData> {}

export interface CreateExamResultData {
  studentId: string;
  obtainedMarks: number;
  grade?: string;
  subjectWiseMarks?: any;
  topicWiseMarks?: any;
  feedback?: string;
  answerScript?: string;
}

export interface BulkExamResultData {
  results: CreateExamResultData[];
}

export interface ExamStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  draft: number;
  publishedResults: number;
  totalStudents: number;
  averageMarks: number;
  popularSubjects: Array<{ subject: string; _count: number }>;
  completionRate: number;
}
