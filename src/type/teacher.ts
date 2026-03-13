// src/types/teacher.ts
export interface Teacher {
  id: string;
  userId: string;
  name: string;
  bio?: string | null;
  qualification?: string | null;
  expertise: string[];
  profileImage?: string | null;
  coverImage?: string | null;
  designation?: string | null;
  institute?: string | null;
  experience?: number | null;
  achievements: string[];
  employeeId?: string | null;
  joiningDate?: Date | null;
  specializations: string[];
  researchPapers?: any;
  awards: string[];
  gstNumber?: string | null;
  panNumber?: string | null;
  bankDetails?: any;
  upiId?: string | null;
  website?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  twitter?: string | null;
  officeHours?: any;
  totalStudents: number;
  averageRating: number;
  totalCourses: number;
  totalBatches: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: {
    id: string;
    email: string;
    phone: string;
    isActive: boolean;
    isVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    lastLogin?: Date | null;
  };
  courses?: any[];
  batches?: any[];
  exams?: any[];
  quizzes?: any[];
  notes?: any[];
}

export interface CreateTeacherData {
  email: string;
  password: string;
  phone: string;
  alternatePhone?: string;
  name: string;
  bio?: string;
  qualification?: string;
  expertise?: string[];
  profileImage?: string;
  coverImage?: string;
  designation?: string;
  institute?: string;
  experience?: number;
  achievements?: string[];
  employeeId?: string;
  joiningDate?: string;
  specializations?: string[];
  researchPapers?: any;
  awards?: string[];
  gstNumber?: string;
  panNumber?: string;
  bankDetails?: any;
  upiId?: string;
  website?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  officeHours?: any;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  isActive?: boolean;
}

export interface TeacherFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  subject?: string;
  minExperience?: number;
  sortBy?: "name" | "experience" | "averageRating" | "createdAt";
  sortOrder?: "asc" | "desc";
}
