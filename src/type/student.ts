// src/types/student.ts
export interface Student {
  id: string;
  userId: string;
  name: string;
  dateOfBirth?: Date | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  institute?: string | null;
  educationLevel?: string | null;
  class?: string | null;
  board?: string | null;
  hscYear?: number | null;
  group?: string | null;
  rollNumber?: string | null;
  registrationNumber?: string | null;
  guardianId?: string | null;
  preferredSubjects: string[];
  learningGoals: string[];
  examTargets: string[];
  totalCourses: number;
  averageScore: number;
  attendanceRate: number;
  rank?: number | null;
  percentile?: number | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: {
    id: string;
    email: string;
    phone: string;
    alternatePhone?: string | null;
    isActive: boolean;
    isVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLogin?: Date | null;
    createdAt: Date;
  };
  guardian?: {
    id: string;
    name: string;
    relationship: string;
    occupation?: string | null;
  };
  enrollments?: any[];
  _count?: {
    enrollments: number;
    attendances: number;
    quizResults: number;
    examResults: number;
    payments: number;
    doubts: number;
  };
}

export interface CreateStudentData {
  email: string;
  password: string;
  phone: string;
  alternatePhone?: string;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  profileImage?: string;
  coverImage?: string;
  institute?: string;
  educationLevel?: string;
  class?: string;
  board?: string;
  hscYear?: number;
  group?: string;
  rollNumber?: string;
  registrationNumber?: string;
  guardianId?: string;
  preferredSubjects?: string[];
  learningGoals?: string[];
  examTargets?: string[];
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateStudentData extends Partial<CreateStudentData> {
  isActive?: boolean;
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  class?: string;
  board?: string;
  educationLevel?: string;
  hasGuardian?: boolean;
  sortBy?: "name" | "createdAt" | "averageScore" | "attendanceRate";
  sortOrder?: "asc" | "desc";
}
