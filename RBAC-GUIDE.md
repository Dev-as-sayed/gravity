# Role-Based Access Control Guide

## Role Hierarchy & Profiles

```
TEACHER ─── has Teacher profile (full CRUD on everything)
  └── MODERATOR ─── has Moderator profile (assistant, granular JSON permissions)
        └── STUDENT ─── has Student profile (own data only)
        └── GUARDIAN ─── has Guardian profile (read-only, children's data)
```

### User → Profile Mapping

Each `User` has exactly one of four profile types, determined by `user.role`:

| Role | Profile Model | Key Fields | Permission Model |
|------|---------------|-----------|------------------|
| `TEACHER` | `Teacher` (userId FK) | `permissions` (Json) | Full access to everything |
| `MODERATOR` | `Moderator` (userId FK) | `permissions` (Json), `assignedBy` (Teacher ID), `batches[]` | Granular JSON-based permissions, scoped to batches |
| `STUDENT` | `Student` (userId FK) | `guardianId`, `enrollments[]`, `class`, `board` | Own data only |
| `GUARDIAN` | `Guardian` (userId FK) | `students[]` (linked children) | Read-only, children's data only |

## Dashboard Page Access by Role

### Teacher — Full Access
All dashboard pages are accessible. Teacher is the admin-equivalent role.

### Moderator — Teacher's Assistant
| Page | Access | Notes |
|------|--------|-------|
| Dashboard Home | ✅ | |
| Students | ✅ | View only |
| Batches | ✅ | View only |
| Enrollments | ✅ | View only |
| Attendance | ✅ | May mark attendance |
| Doubts | ✅ | Can resolve/assign |
| Reported Content | ✅ | Can moderate |
| Announcements | ✅ | Can create/manage |
| Support Tickets | ✅ | Can respond/resolve |
| Logs | ✅ | View only |
| Settings | ✅ | View only |
| Messages | ✅ | |
| Profile | ✅ | |
| Reports | ✅ | View only |
| Analytics | ❌ | Teacher only |
| Courses | ❌ | Teacher only |
| Quizzes/Exams | ❌ | Teacher only |
| Notes | ❌ | Teacher only |
| Payments | ❌ | Teacher only |
| Assignments | ❌ | Teacher only |
| Live Sessions | ❌ | Teacher only |
| Blogs | ❌ | Teacher only |
| Posts/Media | ❌ | Teacher only |
| Reviews | ❌ | Teacher only |
| Teachers | ❌ | Teacher only |
| Moderators | ❌ | Teacher only |
| Guardians | ❌ | Teacher only |
| Users | ❌ | Teacher only |

### Student — Own Data Only
| Page | Access | Notes |
|------|--------|-------|
| Student Home (`/student`) | ✅ | |
| My Batches | ✅ | Enrolled batches only |
| My Doubts | ✅ | Own doubts |
| My Profile | ✅ | |
| My Progress | ✅ | |
| My Analytics | ✅ | |
| My Notes | ✅ | |
| My Exams | ✅ | Enrolled exams |
| My Quizzes | ✅ | Enrolled quizzes |
| My Assignments | ✅ | Assigned work |
| My Attendance | ✅ | Own records |
| My Results | ✅ | Own results |
| My Certificates | ✅ | Earned certs |
| My Payments/Fees | ✅ | Own payments |
| My Blogs | ✅ | Own blogs |
| My Timetable | ✅ | |
| My Guardian | ✅ | Linked guardian |
| Practice/Papers | ✅ | |
| Live Classes | ✅ | Enrolled only |
| Forum | ✅ | Read/interact |
| Messages | ✅ | Own conversations |
| Support Tickets | ✅ | Own tickets |
| Dashboard Home | ✅ | Limited view |
| Teacher Dashboard | ❌ | |
| Students List | ❌ | |
| Enrollments (manage) | ❌ | |
| Attendance (manage) | ❌ | |
| Reported Content | ❌ | (can report though) |
| Announcements | ✅ | Read only |
| Settings | ✅ | Own settings |
| Logs | ❌ | |
| Courses (manage) | ❌ | |
| All Users | ❌ | |
| Payments (manage) | ❌ | |

### Guardian — Read-Only, Child-Focused
| Page | Access | Notes |
|------|--------|-------|
| Student Progress | ✅ | Linked children |
| Student Attendance | ✅ | |
| Student Results | ✅ | |
| Student Payments | ✅ | |
| Announcements | ✅ | Read only |
| Messages | ✅ | With teachers |
| Support Tickets | ✅ | Own tickets |
| Schedule | ✅ | Child's schedule |
| Profile/Settings | ✅ | Own only |
| Blogs/Posts | ✅ | Read only |
| Enrollments (manage) | ❌ | |
| Any management page | ❌ | |

## API Route Authentication Pattern

All API routes use:
```ts
import { authenticate } from "@/lib/apiAuthenticator";

export async function GET(req: NextRequest) {
  const auth = await authenticate(req, "TEACHER", "MODERATOR");
  if (!auth.success) return sendResponse({ ... });
  // ...
}
```

### Role Constants by Route Category

| Category | Allowed Roles |
|----------|--------------|
| Read own data | `TEACHER`, `MODERATOR`, `STUDENT` |
| Management (CRUD) | `TEACHER` |
| Moderation | `TEACHER`, `MODERATOR` |
| Reports & Analytics | `TEACHER`, `MODERATOR` (analytics: `TEACHER` only) |
| Student academic | `TEACHER`, `STUDENT` |
| Public read | `TEACHER`, `STUDENT`, `GUARDIAN` |
| Support & Messages | `TEACHER`, `MODERATOR`, `STUDENT` |
| Report content | `TEACHER`, `MODERATOR`, `STUDENT` |
| Notification prefs | `STUDENT` only |

## Frontend Implementation Guidelines

### 1. Protect Dashboard Layout

```tsx
// src/app/dashboard/layout.tsx
const { data: session } = useSession();
const role = session?.user?.role;

// Redirect STUDENT to /dashboard/student
// Redirect GUARDIAN to /student (child view) or limited home
// Only TEACHER and MODERATOR see the full dashboard
```

### 2. Role-Based Sidebar Menu

```tsx
const menuItems = [
  // All roles
  { label: "Home", href: "/dashboard", roles: ["TEACHER", "MODERATOR"] },
  // Teacher + Moderator
  { label: "Students", href: "/dashboard/students", roles: ["TEACHER", "MODERATOR"] },
  { label: "Attendance", href: "/dashboard/attendance", roles: ["TEACHER", "MODERATOR"] },
  // Teacher only
  { label: "Analytics", href: "/dashboard/analytics", roles: ["TEACHER"] },
  { label: "Payments", href: "/dashboard/payments", roles: ["TEACHER"] },
];
```

### 3. Profile Lookup Pattern

```tsx
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    role: true,
    teacher: { select: { id: true, name: true, /* ... */ } },
    student: { select: { id: true, name: true, /* ... */ } },
    moderator: { select: { id: true, name: true, permissions: true } },
  },
});

const profile = user?.teacher ?? user?.student ?? user?.moderator ?? user?.guardian;
```

### 4. Moderator Permission Check

```tsx
// Moderator has a JSON `permissions` field
const canManageAttendance = (user: any) => {
  if (user.role === "TEACHER") return true;
  if (user.role === "MODERATOR") {
    const perms = user.moderator?.permissions as Record<string, boolean>;
    return perms?.manageAttendance === true;
  }
  return false;
};
```

### 5. Data Scoping

- **Teacher**: No scope restrictions (can see all data)
- **Moderator**: Scoped by `moderator.batches[]` — should filter queries by assigned batch IDs
- **Student**: Scoped by `student.id` — only their own enrollments, results, etc.
- **Guardian**: Scoped by `guardian.students[]` — only data of linked children

### 6. Student Zone Pattern

All student-facing pages live under `/dashboard/student/*`. The layout at `/dashboard/student/layout.tsx` should verify `user.role === "STUDENT"` and redirect otherwise.

### 7. API Slices — Tag-Based Cache

```ts
// src/store/api/baseApi.ts
export const baseApi = createApi({
  tagTypes: [
    "Teacher", "Student", "Moderator", "Guardian",  // role-specific
    "Batch", "Enrollment", "Course",                  // academic
    "Attendance", "ExamResult", "QuizResult",          // records
    "Payment", "Support", "Report",                    // operations
    // ...
  ],
});
```

Use `providesTags`/`invalidatesTags` to keep role-specific caches separated.

## Quick Reference: Role IDs in API Responses

When calling `/api/profile`, the response includes:

```json
{
  "role": "TEACHER",
  "teacher": { "id": "tch_xxx", "name": "...", ... },
  "student": null,
  "moderator": null
}
```

Always check `role` first, then access the matching profile sub-object. The other three will be `null`.
