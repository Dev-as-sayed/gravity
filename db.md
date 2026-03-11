# Gravity Platform Database Schema Summary

## 📊 Overview

A comprehensive PostgreSQL database for a physics education platform with multi-role user management, batch/course management, payment processing, assessment systems, and social features.

## 👥 User Roles & Hierarchy

### **Core User Model** (`User`)

- Base model for all users with authentication fields
- Links to role-specific profiles (Teacher, Student, Guardian, Moderator, Admin)
- Tracks: email, phone, password, verification status, last login

### **Role-Based Profiles**

| Role          | Purpose                        | Key Relations                                          |
| ------------- | ------------------------------ | ------------------------------------------------------ |
| **Teacher**   | Content creators & instructors | Batches, Courses, Exams, Quizzes, Notes, Blogs, Posts  |
| **Student**   | Learners                       | Enrollments, Attendances, Results, Submissions, Doubts |
| **Guardian**  | Parent/guardian of students    | Linked to Student profiles, receives notifications     |
| **Moderator** | Batch assistants               | Assigned to batches with granular permissions          |
| **Admin**     | Platform administrators        | System-wide permissions, user management               |

## 🔗 Key Relationships

### **Academic Structure**

```
Course ──has many──> Batch ──has many──> Enrollment ──belongs to──> Student
  │                    │                       │
  │                    ├── has many──> Quiz     └── has many──> Payment
  │                    ├── has many──> Exam
  │                    ├── has many──> Assignment
  │                    └── has many──> LiveSession
```

### **User ↔ Content Relations**

| Relation Type           | Models                                                            | Description                                       |
| ----------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| **Teacher Content**     | Teacher → {Courses, Batches, Quizzes, Exams, Notes, Blogs, Posts} | Teachers create and manage educational content    |
| **Student Engagement**  | Student → {Enrollments, QuizAttempts, ExamResults, Submissions}   | Students interact with content and track progress |
| **Guardian Connection** | Guardian → Student                                                | One guardian can monitor multiple students        |

## 📦 Core Modules

### 1. **Batch Management**

- **Course**: Parent entity for subject categories
- **Batch**: Individual class groups with schedule, pricing, capacity
- **Enrollment**: Student enrollment with status tracking
- **Installment**: Payment installment plans

### 2. **Assessment System**

- **Quiz**: Timed assessments with questions
- **Question**: Reusable question bank
- **QuizAttempt**: Student attempt tracking
- **QuizResult**: Graded results with analytics
- **Exam**: Formal examinations
- **ExamResult**: Exam performance tracking

### 3. **Learning Materials**

- **Note**: PDFs, videos, study materials
- **Assignment**: Homework and projects
- **AssignmentSubmission**: Student submissions with grading
- **Doubt**: Student question resolution system
- **DoubtAnswer**: Teacher responses to doubts

### 4. **Live Learning**

- **LiveSession**: Scheduled online classes
- **LiveSessionAttendance**: Student attendance tracking
- **Attendance**: Regular class attendance

### 5. **Social/Community Features**

- **Post**: User-generated content with media
- **MediaAttachment**: Images/videos in posts
- **Comment**: Threaded comments on posts
- **PostReaction**: Likes, loves, etc.
- **CommentReaction**: Reactions on comments
- **PostBookmark**: Saved posts with collections
- **PostCollection**: User-created folders
- **Poll**: Interactive polls in posts
- **PollVote**: User votes on polls

### 6. **Blog System**

- **Blog**: Articles by teachers
- **BlogComment**: Reader comments

### 7. **Payment & Finance**

- **Payment**: Transaction records
- **Coupon**: Discount codes
- **SubscriptionPlan**: Teacher subscription tiers
- **TeacherSubscription**: Teacher plan enrollments

### 8. **Communication**

- **Notification**: User notifications
- **NotificationPreference**: User notification settings
- **Announcement**: Batch announcements
- **SupportTicket**: Customer support requests
- **TicketMessage**: Support conversation threads

### 9. **Analytics & Tracking**

- **StudentProgress**: Performance metrics per batch
- **UserActivity**: User action logging
- **PostView**: Content view tracking
- **PostShare**: Content sharing tracking

### 10. **Marketing**

- **Lead**: Prospective student inquiries
- **Referral**: User referral tracking

### 11. **System**

- **Session**: User login sessions
- **AuditLog**: System action logging
- **OTP**: One-time passwords
- **DeviceToken**: Push notification tokens
- **SystemConfig**: Platform configuration

## 🔑 Key Indexes

| Table      | Indexed Fields                | Purpose                      |
| ---------- | ----------------------------- | ---------------------------- |
| User       | email, phone, role            | Fast authentication & lookup |
| Batch      | teacherId, courseId, isActive | Batch filtering              |
| Enrollment | studentId, batchId, status    | Enrollment queries           |
| Payment    | studentId, status, dueDate    | Payment tracking             |
| Post       | createdAt, isFeatured         | Content feeds                |
| Comment    | postId, createdAt             | Threaded comments            |

## 💡 Design Patterns

1. **Polymorphic Relations**: Users can create content (posts, comments) as different roles
2. **Soft Deletes**: Status fields instead of hard deletion
3. **Audit Trail**: AuditLog for critical operations
4. **JSON Fields**: Flexible metadata storage
5. **Composite Unique Keys**: Prevent duplicates (e.g., one reaction per user per post)

## 🎯 Business Logic Highlights

- **Enrollment Workflow**: PENDING → APPROVED/REJECTED → COMPLETED/DROPPED
- **Payment States**: PENDING → PROCESSING → COMPLETED/FAILED/REFUNDED
- **Quiz/Exam Lifecycle**: DRAFT → PUBLISHED → ACTIVE → COMPLETED
- **Doubt Resolution**: OPEN → ANSWERED → RESOLVED/CLOSED
- **Content Visibility**: PUBLIC, STUDENTS_ONLY, BATCH_ONLY, TEACHERS_ONLY

## 📈 Scalability Considerations

- Strategic indexes on frequently queried fields
- JSON fields for flexible schemas
- Separate tables for high-volume data (views, shares)
- Audit logging for compliance
- Soft deletion patterns

This schema supports a complete educational platform with social features, assessment tools, payment processing, and comprehensive analytics.
