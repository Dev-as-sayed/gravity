# Gravity Platform — Full Completion Todo

## Project Stats
| Metric | Count |
|--------|-------|
| Page files | 98 |
| API routes | 123 |
| Store API slices | 27 |
| Components | 22 |
| Prisma models | 57 |
| Dashboard pages | 40+ |
| Student pages | 30 |
| Guardian pages | 20 |
| Seed users | 628 |

---

## Phase 1 — Empty Public Pages

### 1.1 `/blog` page (5 lines — EMPTY)
- [ ] Build blog listing page with pagination
- [ ] Create `/blog/[slug]` detail page
- [ ] Wire up `useGetBlogsQuery` from `blogApi`
- [ ] Add category/tag filtering

### 1.2 `/notes` page (5 lines — EMPTY)
- [ ] Build public notes listing page
- [ ] Wire up note browsing with subject/class filters
- [ ] Link to `/notes/[id]` detail or download page

### 1.3 Home page polish
- [ ] Verify all 7 section components render correctly (Hero, Benefits, Steps, Results, Resources, FAQ, CTA)
- [ ] Add loading states for dynamic data sections
- [ ] Add error boundaries

---

## Phase 2 — Dashboard Enhancements

### 2.1 Root `/dashboard` page
- [ ] Currently hardcoded as "Moderator Dashboard" (50 lines)
- [ ] Redirect by role: TEACHER → `/dashboard/teacher`, MODERATOR → `/dashboard/dashboard`, STUDENT → `/dashboard/student`
- [ ] Or build a role-aware home page

### 2.2 Missing Create/Edit Pages
- [ ] **Batch create** page (`/dashboard/batches/create`)
- [ ] **Batch edit** page (`/dashboard/batches/[id]/edit`)
- [ ] **Course create** page (`/dashboard/courses/create`)
- [ ] **Course edit** page (`/dashboard/courses/[id]/edit`)
- [ ] **Live session create** (detail already exists under `/dashboard/live-sessions` but no create form)
- [ ] **Assignment create** page

### 2.3 Thin/Placeholder Pages (50–85 lines)
These pages have basic hooks but minimal UI:

| Page | Lines | Priority |
|------|-------|----------|
| `/dashboard/comments` | 85 | Low |
| `/dashboard/student/notes` | 48 | Low |
| `/dashboard/student/practice` | 48 | Low |
| `/dashboard/student/formulas` | 51 | Low |
| `/dashboard/student/forum` | 53 | Medium |
| `/dashboard/student/blogs` | 55 | Low |
| `/dashboard/student/media` | 56 | Low |
| `/dashboard/student/quizzes` | 56 | Low |
| `/dashboard/student/certificates` | 61 | Medium |
| `/dashboard/student/papers` | 61 | Low |
| `/dashboard/student/recordings` | 61 | Low |
| `/dashboard/student/guardian` | 63 | Low |
| `/dashboard/student/my-doubts` | 64 | Medium |
| `/dashboard/student/test-series` | 67 | Low |
| `/dashboard/student` (home) | 71 | Medium |
| `/dashboard/student/exams` | 74 | Medium |
| `/dashboard/student/settings` | 73 | Medium |
| `/dashboard/teacher` | 66 | High |
| `/dashboard/analytics/performance` | 78 | Medium |
| `/dashboard/student/attendance` | 78 | Medium |
| `/dashboard/student/live-classes` | 83 | Medium |
| `/dashboard/student/achievements` | 85 | Low |

### 2.4 Missing Teacher Analytics
- `/dashboard/analytics/performance` (78 lines) — needs charts, trend data
- `/dashboard/analytics/progress` (100 lines) — needs student progress tracking UI

---

## Phase 3 — Student Academic Workflow

### 3.1 Quiz Taking Interface
- [ ] API routes exist at `/api/quizzes/[id]/attempt` and `/api/quizzes/[id]/attempt/[attemptId]/submit`
- [ ] **Missing front-end pages:**
- [ ] Build quiz taking page (`/dashboard/student/quizzes/[id]/attempt`)
- [ ] Timer/clock functionality
- [ ] Question navigation (prev/next, question palette)
- [ ] Auto-submit on time expiry
- [ ] Results display after submission

### 3.2 Exam Taking Interface
- [ ] Build exam taking page (`/dashboard/student/exams/[id]/attempt`)
- [ ] Support for different question types (MCQ, subjective, numerical)
- [ ] File upload for subjective answers
- [ ] Results/review page

### 3.3 Assignment Submission
- [ ] Assignment detail view with submission form
- [ ] File upload for assignment submissions
- [ ] View grades/feedback after teacher review

### 3.4 Live Session Viewer
- [ ] Embed video player (YouTube/Vimeo/Jitsi)
- [ ] Chat side panel
- [ ] Session recording playback

---

## Phase 4 — Payment & Financial

### 4.1 Payment Gateway Integration
- [ ] Integrate Razorpay/Stripe
- [ ] Create payment intent API endpoint
- [ ] Enrollment payment flow (course → checkout → pay → enroll)
- [ ] Payment success/failure webhooks
- [ ] Installment payment support

### 4.2 Fee Management
- [ ] Fee structure creation (Teacher only)
- [ ] Due date tracking & reminders
- [ ] Late fee calculation
- [ ] Discount/coupon application
- [ ] Receipt generation (PDF)

### 4.3 Student Payment Portal
- [ ] `/dashboard/student/fees` — view fee structure & dues
- [ ] `/dashboard/student/payments` — payment history
- [ ] `/dashboard/student/invoices` — invoice download
- [ ] Online payment from student portal

---

## Phase 5 — Communication & Notifications

### 5.1 Real-Time Messaging
- [ ] WebSocket/Socket.io integration for live chat
- [ ] Read receipts
- [ ] Typing indicators
- [ ] File/image sharing in messages
- [ ] Push notification for new messages

### 5.2 Notification Delivery
- [ ] Email notifications (using Resend/SendGrid)
- [ ] Push notifications (using Firebase/OneSignal)
- [ ] In-app notification center (UI exists at `/dashboard/notifications`)
- [ ] Notification preferences (per user, per type)

### 5.3 Announcements
- [ ] Email blast for urgent announcements
- [ ] Read tracking per batch
- [ ] Scheduled announcements

---

## Phase 6 — Content Management

### 6.1 File Upload
- [ ] Cloud storage integration (S3/Cloudinary)
- [ ] Upload UI for notes, assignments, profile images
- [ ] File type validation & size limits
- [ ] Image optimization

### 6.2 Notes System
- [ ] Note preview (PDF viewer)
- [ ] Bookmarking/favorites
- [ ] Rating & review
- [ ] Category/subject hierarchy

### 6.3 Media Library
- [ ] Image gallery with lightbox
- [ ] Video upload & streaming
- [ ] Media categorization

---

## Phase 7 — Reports & Analytics

### 7.1 Teacher Reports
- [ ] Performance dashboard with charts (recharts/chart.js)
- [ ] Batch comparison
- [ ] Student-wise performance trends
- [ ] Attendance analytics
- [ ] Payment/fee collection reports
- [ ] Export to CSV/PDF

### 7.2 Student Analytics
- [ ] Progress over time (line charts)
- [ ] Subject-wise strength/weakness
- [ ] Rank tracking
- [ ] Attendance calendar
- [ ] Quiz/exam score distribution

### 7.3 Guardian Reports
- [ ] Child progress reports
- [ ] Attendance summary
- [ ] Fee payment status
- [ ] Comparative performance

---

## Phase 8 — Certificate & Achievement System

### 8.1 Certificate Generation
- [ ] Certificate template design
- [ ] Auto-generate PDF on course completion
- [ ] Certificate verification page (public)
- [ ] Download/share certificate

### 8.2 Achievement Badges
- [ ] Badge definitions (streak, top performer, etc.)
- [ ] Auto-award on criteria match
- [ ] Display on student profile

---

## Phase 9 — Moderator System

### 9.1 Permission System
- [ ] Implement granular JSON permission checks in API routes
- [ ] Moderator management UI for Teacher (`/dashboard/moderators`)
- [ ] Batch assignment UI

### 9.2 Moderator Workflows
- [ ] Pending posts approval
- [ ] Note approval pipeline
- [ ] Comment moderation
- [ ] Doubt assignment & resolution tracking

---

## Phase 10 — Infrastructure & Quality

### 10.1 Error Handling
- [ ] Global error boundary (`/error.tsx` — does not exist at root level)
- [ ] Toast/snackbar notification system for API errors
- [ ] Form validation (client + server)
- [ ] Rate limiting feedback in UI

### 10.2 Loading States
- [ ] Skeleton loaders for all data pages
- [ ] Progressive loading for large lists
- [ ] Optimistic updates for mutations

### 10.3 Empty States
- [ ] Empty state components for all list pages
- [ ] CTA prompts when no data (e.g., "Create your first batch")

### 10.4 Responsive Design
- [ ] Audit all pages for mobile responsiveness
- [ ] Touch-friendly interactions for tablets
- [ ] Print stylesheets for reports/invoices

### 10.5 Performance
- [ ] Image optimization (next/image for all)
- [ ] API response caching
- [ ] Infinite scroll or "load more" for lists
- [ ] Bundle analysis & code splitting

### 10.6 SEO
- [ ] Meta tags for all public pages
- [ ] Open Graph tags
- [ ] Sitemap generation
- [ ] Structured data (JSON-LD)

### 10.7 Security
- [ ] Rate limiting on auth routes
- [ ] Input sanitization
- [ ] CSRF protection
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention
- [ ] Audit logging for sensitive operations

### 10.8 Testing
- [ ] Unit tests for API routes
- [ ] Component tests for UI
- [ ] Integration tests for auth flow
- [ ] E2E tests for critical paths (login, enroll, pay)

---

## Phase 11 — Deployment & DevOps

### 11.1 Environment Configuration
- [ ] `.env.example` with all required vars
- [ ] Production env setup
- [ ] Secrets management

### 11.2 Database
- [ ] Migration strategy for production
- [ ] Backup automation
- [ ] Connection pooling

### 11.3 CI/CD
- [ ] GitHub Actions for lint + typecheck + test
- [ ] Auto-deploy on merge
- [ ] Preview deployments for PRs

### 11.4 Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] API usage analytics
- [ ] Uptime monitoring

### 11.5 Docker
- [ ] Dockerfile for production build
- [ ] docker-compose for local dev (app + postgres)
- [ ] Health check endpoints

---

## Phase 12 — Additional Features

### 12.1 Forgot/Reset Password
- [ ] `/auth/forgot-password` page
- [ ] `/auth/reset-password/[token]` page
- [ ] Email sending for reset link
- [ ] Token expiry & validation

### 12.2 Email Verification
- [ ] Verification email on registration
- [ ] `/auth/verify-email/[token]` page
- [ ] Resend verification option

### 12.3 Public API
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting per API key
- [ ] Webhook for external integrations

### 12.4 Leaderboard & Gamification
- [ ] Batch-wise leaderboard
- [ ] Streak tracking
- [ ] XP/points system
- [ ] Weekly/monthly challenges

### 12.5 Offline Support
- [ ] PWA manifest
- [ ] Service worker for caching
- [ ] Offline note access
- [ ] Background sync for submissions

### 12.6 Multi-language
- [ ] i18n setup
- [ ] Hindi/regional language support
- [ ] RTL layout support

---

## Quick Win Priority Matrix

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 P0 | `/blog` and `/notes` public pages | 1 day | High (dead pages) |
| 🔴 P0 | Quiz/exam taking interface | 3 days | High (core learning flow) |
| 🔴 P0 | Payment gateway integration | 3 days | High (revenue) |
| 🟡 P1 | Dashboard home by role | 0.5 day | High (UX) |
| 🟡 P1 | Forgot/reset password | 1 day | High (auth) |
| 🟡 P1 | Error boundaries + loading states | 2 days | Medium (UX) |
| 🟡 P1 | Thin student pages (50-85 lines) | 3 days | Medium |
| 🟢 P2 | Certificate generation | 2 days | Medium |
| 🟢 P2 | Real-time messaging | 3 days | Medium |
| 🟢 P2 | Reports with charts | 3 days | Medium |
| 🔵 P3 | File upload to cloud | 2 days | Medium |
| 🔵 P3 | Email notifications | 2 days | Low |
| ⚪ P4 | Testing, CI/CD, monitoring | 5 days | Low (ops) |
| ⚪ P4 | PWA, i18n, leaderboard | 5 days | Low (nice-to-have) |

---

## Current State Summary

| Area | Status | Coverage |
|------|--------|----------|
| Public pages | 80% complete | Home, About, Contact, Media, Course ✓ | Blog, Notes ✗ |
| Auth system | 90% complete | Login, Register, Session ✓ | Forgot/Reset password ✗ |
| Dashboard (teacher) | 85% complete | 30+ pages with API + hooks ✓ | Missing create/edit pages |
| Dashboard (student) | 75% complete | 30 sub-pages exist ✓ | Thin UI on many pages |
| Guardian portal | 80% complete | 20 pages ✓ | Limited features |
| API routes | 95% complete | 123 routes ✓ | Payment gateway missing |
| Store API | 90% complete | 27 slices ✓ | Some thin endpoints |
| Prisma schema | 100% complete | 57 models ✓ | Fully migrated |
| Quiz/Exam attempt UI | 0% | API exists, no front-end pages |
| Forgot/Reset password | 0% | No pages or routes exist |
| Payment gateway integration | 0% | API stubs exist, no real gateway |
| File upload to cloud | 0% | Upload UI exists, no cloud storage |
| Certificate generation | 0% | Model exists, no feature |
| Test files | 0% | No tests anywhere in project |
| Seed data | 100% complete | 628 users ✓ |
| TypeScript | 100% clean | `tsc --noEmit` passes ✓ | Zero errors |
