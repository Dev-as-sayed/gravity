# Gravity — Single-Teacher Migration Todo

## Goal
Convert the multi-teacher LMS platform into a **single-teacher platform** with 4 roles:
- **Teacher** — the sole owner/admin of the platform (was SUPER_ADMIN/ADMIN)
- **Moderator** — teacher's helping hand for management (was MODERATOR, simplified)
- **Student** — learners
- **Guardian** — parents/guardians of students

---

## Phase 1 — Database Schema (`prisma/schema.prisma`)

### 1.1 Roles enum
- Remove `SUPER_ADMIN`, `ADMIN` from `UserRole` enum
- Keep `TEACHER`, `MODERATOR`, `STUDENT`, `GUARDIAN`

### 1.2 Models to remove
| Model | Lines | Reason |
|---|---|---|
| `Admin` | 427-440 | Replaced by Teacher as owner |
| `TeacherReview` | 818-833 | No multi-teacher ratings needed |
| `SubscriptionPlan` | ~2470-2490 | No subscription tiers needed |
| `TeacherSubscription` | ~2492-2522 | No subscription tracking needed |

### 1.3 Models to simplify
- **`User`**: Remove `admin` relation (line 289)
- **`Teacher`**: Remove `employeeId`, `joiningDate`, `specializations`, `researchPapers`, `awards`, `gstNumber`, `panNumber`, `bankDetails`, `upiId`, `settings`, `officeHours`, `totalStudents`, `averageRating`, `totalCourses`, `totalBatches`, `totalReviews`, `teacherSubscriptions` — keep only identity/profile fields (name, bio, qualification, expertise, profileImage, coverImage, designation, institute, experience, social links, content relations)
- **`Batch`**: Remove `moderators` relation (line 611)
- **`Course`**: Keep as-is (teacherId stays)
- **`Post`**: Keep as-is

### 1.4 Models to keep as-is
- `Teacher`, `Student`, `Guardian`, `Moderator` (simplified)
- All content models: `Batch`, `Course`, `Enrollment`, `Payment`, `Installment`, `Note`, `Quiz`, `Question`, `QuizAttempt`, `QuizResult`, `Exam`, `ExamResult`, `Attendance`, `LiveSession`, `LiveSessionAttendance`, `Assignment`, `AssignmentSubmission`, `Doubt`, `DoubtAnswer`, `BatchReview`, `Certificate`, `BatchMaterial`, `Post`, `MediaAttachment`, `PostReaction`, `Comment`, `CommentReaction`, `PostBookmark`, `Poll`, `PollVote`, `PostView`, `PostShare`, `PostCollection`, `Announcement`, `Blog`, `StudentProgress`, `Notification`, `NotificationPreference`, `DeviceToken`, `UserActivity`, `Session`, `OTP`, `AuditLog`, `SupportTicket`, `TicketMessage`, `Referral`

---

## Phase 2 — Remove Admin API Routes

### 2.1 Delete these files (teacher management — no CRUD for single teacher)
- `src/app/api/teachers/route.ts`
- `src/app/api/teachers/stats/route.ts`
- `src/app/api/teachers/bulk/route.ts`
- `src/app/api/teachers/[id]/route.ts`

### 2.2 Delete these files (guardian management — simplify)
- `src/app/api/guardians/route.ts`
- `src/app/api/guardians/stats/route.ts`
- `src/app/api/guardians/bulk/route.ts`
- `src/app/api/guardians/[id]/route.ts`
- `src/app/api/guardians/[id]/preferences/route.ts`
- `src/app/api/guardians/[id]/students/route.ts`

### 2.3 Simplify remaining API routes
Search for `SUPER_ADMIN` and `ADMIN` references in ALL route files and replace with `TEACHER` or remove.

**Files to update** (non-exhaustive — search for all occurrences):
- `src/app/api/users/route.ts` — remove SUPER_ADMIN-only teacher/student detail includes
- `src/app/api/users/[id]/route.ts` — remove admin-only profile expansion
- `src/app/api/batches/route.ts` — remove admin role checks
- `src/app/api/batches/stats/route.ts` — simplify role filtering
- `src/app/api/courses/route.ts` — simplify role filtering
- `src/app/api/enrollments/route.ts` — simplify
- `src/app/api/enrollments/stats/route.ts` — simplify
- `src/app/api/payments/route.ts` — simplify
- `src/app/api/payments/stats/route.ts` — simplify
- `src/app/api/quizzes/route.ts` — simplify
- `src/app/api/quizzes/stats/route.ts` — simplify
- `src/app/api/exams/route.ts` — simplify
- `src/app/api/exams/stats/route.ts` — simplify
- `src/app/api/notes/route.ts` — simplify
- `src/app/api/notes/stats/route.ts` — simplify
- `src/app/api/media/route.ts` — simplify
- `src/app/api/media/stats/route.ts` — simplify
- `src/app/api/doubts/route.ts` — simplify
- `src/app/api/doubts/stats/route.ts` — simplify
- `src/app/api/moderators/route.ts` — simplify (teacher assigns, not admin)
- `src/app/api/moderators/bulk/route.ts` — simplify
- `src/app/api/moderators/[id]/route.ts` — simplify
- `src/app/api/moderators/[id]/activity/route.ts` — simplify
- `src/app/api/moderators/[id]/batches/route.ts` — simplify
- `src/app/api/moderators/stats/route.ts` — simplify
- `src/app/api/enrollments/bulk/route.ts` — simplify
- `src/app/api/students/route.ts` — simplify
- `src/app/api/students/bulk/route.ts` — simplify
- `src/app/api/students/stats/route.ts` — simplify

---

## Phase 3 — Auth & Role Simplification

### 3.1 `src/lib/apiAuthenticator.ts`
- Change `UserRole` type to: `"TEACHER" | "MODERATOR" | "STUDENT" | "GUARDIAN"`
- Remove `adminId`, `moderatorId` from `AuthenticatedUser` (keep mod if needed)
- Remove `hasRoleLevel()` — no hierarchy needed (or flat: TEACHER > MODERATOR > STUDENT > GUARDIAN)
- Remove SUPER_ADMIN bypass in `hasRole()` and `authenticate()`
- Simplify `isResourceOwner()` — Teacher owns everything, remove ADMIN/SUPER_ADMIN checks
- Remove `admin` from Prisma includes in `authenticateWithOptions()`

### 3.2 `src/middleware.ts`
- Remove `/admin` path check
- Update role checks for new role names
- Simplify matcher to: `/dashboard/:path*`, `/profile/:path*`

### 3.3 `src/lib/auth.ts`
- Remove `adminId` from JWT/session callbacks
- Simplify `authorize` callback — only TEACHER registration is blocked (only seed teacher exists)

### 3.4 `src/type/next-auth.d.ts`
- Remove `adminId` from session types
- Keep `teacherId`, `studentId`, `guardianId`, `moderatorId`

---

## Phase 4 — Dashboard Pages

### 4.1 Delete entire `/dashboard/admin/` directory
All pages and subdirectories under `src/app/dashboard/admin/` — they are no longer needed.

### 4.2 Teacher Dashboard
- The teacher (as owner) now uses what was admin functionality
- Create or repurpose pages under `/dashboard/teacher/` or `/dashboard/` for teacher
- Teacher needs access to: Batches, Students, Courses, Enrollments, Payments, Notes, Quizzes, Exams, Doubts, Media, Blogs, Attendance, Live Sessions, Assignments, Analytics, Profile, Settings

### 4.3 Student Dashboard
- Keep `src/app/dashboard/student/page.tsx`
- Keep `src/app/dashboard/student/my-batches/page.tsx`
- Future: add remaining student pages from nav items

### 4.4 Moderator Dashboard
- Keep moderator-specific pages or create them as needed

---

## Phase 5 — Dashboard Navigation & Layout

### 5.1 `src/utils/dashboardNavItem.ts`
- Remove `adminNavItems` array
- Update `roleNavMap` to 4 entries: `TEACHER`, `MODERATOR`, `STUDENT`, `GUARDIAN`
- Simplify `teacherNavItems` — teacher sees the full management nav (was admin items + teacher items)
- Keep `moderatorNavItems` (simplify — no "Approve Notes" or moderation pipeline if not needed)
- Simplify `studentNavItems`
- Simplify `guardianNavItems`

### 5.2 `src/components/shared/DashboardNav.tsx`
- Update to handle 4 roles (TEACHER, MODERATOR, STUDENT, GUARDIAN)

### 5.3 `src/components/shared/DashboardTopBar.tsx`
- Simplify user menu items

### 5.4 `src/app/dashboard/layout.tsx`
- Remove admin role-specific handling

---

## Phase 6 — Redux Store Cleanup

### 6.1 Remove API files
- `src/store/api/teacherApi.ts` — no teacher management API
- `src/store/api/userManagementApi.ts` — no user management needed
- `src/store/api/guardianApi.ts` — simplify guardian functionality

### 6.2 Simplify remaining APIs
- `src/store/api/baseApi.ts` — remove admin/superadmin tag types
- `src/store/api/moderatorApi.ts` — simplify endpoints

### 6.3 Update store
- `src/store/index.ts` — remove deleted API slices from configureStore
- `src/store/slices/authSlice.ts` — simplify to 4 roles

---

## Phase 7 — Simplify Moderator System

### Schema
- Moderator no longer has `assignedBy` pointing to arbitrary Admin
- Moderator is assigned by the single Teacher
- Permissions simplified — moderator helps with batch management, attendance, doubts, etc.

### API
- All moderator routes remain but are simplified:
  - No SUPER_ADMIN/ADMIN role checks — just TEACHER
  - Moderator CRUD is done by Teacher only
  - Moderator activity tracking simplified

---

## Phase 8 — Seed Data & Migration

### `prisma/seed.sql`
- Create 1 Teacher user (the platform owner)
- Remove ADMIN/SUPER_ADMIN seed users
- Remove SubscriptionPlan seed data
- Simplify Moderator seed (if any)
- Keep Student and Guardian seed data

### `prisma/test.sql`
- Same simplifications

### Migration
- Create new Prisma migration after schema changes
- `npx prisma migrate dev --name single-teacher-migration`

---

## Phase 9 — Frontend Pages & Components

### `src/app/auth/register/page.tsx`
- Remove TEACHER role from registration options
- Only allow STUDENT and GUARDIAN registration
- Remove teacher-specific registration fields

### `src/components/ui/CourseCard.tsx`
- Simplify teacher display (point to the single teacher)

### `src/components/shared/Navbar.tsx`
- Remove admin/teacher role-based menu items for public nav
- Keep simple nav for students/guardians

### `src/hooks/useUser.ts`
- Fix the lowercase role comparison bug (`role === "admin"` → `role === "TEACHER"`)
- Simplify for the new 4-role system

### `src/hooks/useAuth.ts`
- Simplify for new role system

### `src/components/section/Home/*`
- Update marketing copy if it references multiple teachers/institutions

---

## Phase 10 — Final Cleanup

- [ ] Regenerate Prisma client: `npx prisma generate`
- [ ] Remove orphaned imports across all files
- [ ] Run `npm run build` to verify compilation
- [ ] Remove `src/generated/prisma/` git reference (already in .gitignore)
- [ ] Update README.md to reflect single-teacher platform
- [ ] Remove any remaining references to `SUPER_ADMIN`, `ADMIN` via grep
- [ ] Test authentication flow (login, register, session)
- [ ] Test teacher dashboard access
- [ ] Test student dashboard access
- [ ] Test moderator access

---

## Role Mapping (After Migration)

| Old Role | New Role | Access Level |
|---|---|---|
| SUPER_ADMIN | — | Absorbed into TEACHER |
| ADMIN | — | Absorbed into TEACHER |
| TEACHER | TEACHER | Full platform ownership |
| MODERATOR | MODERATOR | Teacher-assigned helper |
| STUDENT | STUDENT | Learner access |
| GUARDIAN | GUARDIAN | Parent/guardian access |

## Files to Delete (Summary)

```
src/app/api/teachers/route.ts
src/app/api/teachers/stats/route.ts
src/app/api/teachers/bulk/route.ts
src/app/api/teachers/[id]/route.ts
src/app/api/guardians/route.ts
src/app/api/guardians/stats/route.ts
src/app/api/guardians/bulk/route.ts
src/app/api/guardians/[id]/route.ts
src/app/api/guardians/[id]/preferences/route.ts
src/app/api/guardians/[id]/students/route.ts
src/app/dashboard/admin/                  (entire directory)
src/store/api/teacherApi.ts
src/store/api/userManagementApi.ts
src/store/api/guardianApi.ts
```

## Files to Modify (Summary)

```
prisma/schema.prisma
src/lib/apiAuthenticator.ts
src/middleware.ts
src/lib/auth.ts
src/type/next-auth.d.ts
src/utils/dashboardNavItem.ts
src/components/shared/DashboardNav.tsx
src/components/shared/DashboardTopBar.tsx
src/app/dashboard/layout.tsx
src/store/api/baseApi.ts
src/store/api/moderatorApi.ts
src/store/index.ts
src/store/slices/authSlice.ts
prisma/seed.sql
prisma/test.sql
src/app/auth/register/page.tsx
src/components/ui/CourseCard.tsx
src/components/shared/Navbar.tsx
src/hooks/useUser.ts
src/hooks/useAuth.ts
```

Plus ~30 API route files that need SUPER_ADMIN/ADMIN references replaced.
