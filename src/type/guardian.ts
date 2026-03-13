// src/types/guardian.ts
export interface Guardian {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  occupation?: string | null;
  income?: number | null;
  notificationPrefs?: any;
  createdAt: string;
  updatedAt: string;

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
    lastLogin?: string | null;
    createdAt: string;
  };
  students?: Array<{
    id: string;
    name: string;
    class?: string | null;
    institute?: string | null;
    user?: {
      email: string;
      phone: string;
    };
  }>;
  _count?: {
    students: number;
    comments: number;
    postReactions: number;
  };
}

export interface CreateGuardianData {
  email: string;
  password: string;
  phone: string;
  alternatePhone?: string;
  name: string;
  relationship: string;
  occupation?: string;
  income?: number;
  notificationPrefs?: any;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface UpdateGuardianData extends Partial<CreateGuardianData> {
  isActive?: boolean;
}

export interface GuardianFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  relationship?: string;
  hasStudents?: boolean;
  sortBy?: "name" | "createdAt" | "relationship";
  sortOrder?: "asc" | "desc";
}

export interface GuardianStats {
  total: number;
  active: number;
  inactive: number;
  byRelationship: Array<{ relationship: string; _count: number }>;
  withStudents: number;
  withoutStudents: number;
  topGuardians: Array<{
    id: string;
    name: string;
    relationship: string;
    _count: { students: number };
    user: { email: string };
  }>;
  recentRegistrations: number;
  coverageRate: number;
  completionRate: number;
}
