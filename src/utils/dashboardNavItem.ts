// Import these icons in your navigation component
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Heart,
  Shield,
  BookOpen,
  Layers,
  ClipboardList,
  FileText,
  Newspaper,
  HelpCircle,
  ScrollText,
  File,
  CreditCard,
  Receipt,
  RotateCcw,
  Tag,
  Headset,
  BarChart,
  FileBarChart,
  Activity,
  Settings,
  Cog,
  History,
  Video,
  CalendarCheck,
  FilePlus,
  FileUp,
  Clipboard,
  PenLine,
  MessageCircle,
  Megaphone,
  TrendingUp,
  User,
  Calendar,
  Star,
  Film,
  Clock,
  PenTool,
  Sigma,
  Award,
  MessagesSquare,
  Archive,
  Trophy,
  CalendarX,
  Mail,
  MessageSquare,
  Download,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  Bell,
} from "lucide-react";

export const adminNavItems = [
  // Dashboard
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },

  // User Management
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Teachers", icon: GraduationCap, path: "/admin/teachers" },
  { name: "Students", icon: UserCheck, path: "/admin/students" },
  { name: "Guardians", icon: Heart, path: "/admin/guardians" },
  { name: "Moderators", icon: Shield, path: "/admin/moderators" },

  // Course & Batch Management
  { name: "Courses", icon: BookOpen, path: "/admin/courses" },
  { name: "Batches", icon: Layers, path: "/admin/batches" },
  { name: "Enrollments", icon: ClipboardList, path: "/admin/enrollments" },

  // Content Management
  { name: "All Posts", icon: FileText, path: "/admin/posts" },
  { name: "Blogs", icon: Newspaper, path: "/admin/blogs" },
  { name: "Quizzes", icon: HelpCircle, path: "/admin/quizzes" },
  { name: "Exams", icon: ScrollText, path: "/admin/exams" },
  { name: "Notes", icon: File, path: "/admin/notes" },

  // Financial
  { name: "Payments", icon: CreditCard, path: "/admin/payments" },
  { name: "Transactions", icon: Receipt, path: "/admin/transactions" },
  { name: "Refunds", icon: RotateCcw, path: "/admin/refunds" },
  { name: "Coupons", icon: Tag, path: "/admin/coupons" },

  // Support
  { name: "Support Tickets", icon: Headset, path: "/admin/support" },
  { name: "Doubts", icon: HelpCircle, path: "/admin/doubts" },

  // Analytics
  { name: "Analytics", icon: BarChart, path: "/admin/analytics" },
  { name: "Reports", icon: FileBarChart, path: "/admin/reports" },
  { name: "Activity Logs", icon: Activity, path: "/admin/logs" },

  // System
  { name: "Settings", icon: Settings, path: "/admin/settings" },
  { name: "System Config", icon: Cog, path: "/admin/system" },
  { name: "Audit Logs", icon: History, path: "/admin/audit" },
];

export const teacherNavItems = [
  // Dashboard
  { name: "Dashboard", icon: LayoutDashboard, path: "/teacher/dashboard" },

  // My Batches
  { name: "My Batches", icon: Layers, path: "/teacher/batches" },
  { name: "Live Sessions", icon: Video, path: "/teacher/live-sessions" },
  { name: "Attendance", icon: CalendarCheck, path: "/teacher/attendance" },

  // Teaching
  { name: "Courses", icon: BookOpen, path: "/teacher/courses" },
  { name: "Students", icon: Users, path: "/teacher/students" },
  { name: "Enrollments", icon: ClipboardList, path: "/teacher/enrollments" },

  // Content Creation
  { name: "Create Post", icon: FilePlus, path: "/teacher/posts/create" },
  { name: "My Posts", icon: FileText, path: "/teacher/posts" },
  { name: "Create Blog", icon: Newspaper, path: "/teacher/blogs/create" },
  { name: "My Blogs", icon: Newspaper, path: "/teacher/blogs" },
  { name: "Upload Notes", icon: FileUp, path: "/teacher/notes/upload" },
  { name: "My Notes", icon: File, path: "/teacher/notes" },

  // Assessments
  { name: "Create Quiz", icon: HelpCircle, path: "/teacher/quizzes/create" },
  { name: "My Quizzes", icon: HelpCircle, path: "/teacher/quizzes" },
  { name: "Create Exam", icon: ScrollText, path: "/teacher/exams/create" },
  { name: "My Exams", icon: ScrollText, path: "/teacher/exams" },
  { name: "Assignments", icon: Clipboard, path: "/teacher/assignments" },

  // Evaluation
  { name: "Quiz Results", icon: Award, path: "/teacher/results/quizzes" },
  { name: "Exam Results", icon: Trophy, path: "/teacher/results/exams" },
  { name: "Grade Assignments", icon: PenLine, path: "/teacher/grade" },

  // Interaction
  { name: "Doubt Solving", icon: MessageCircle, path: "/teacher/doubts" },
  { name: "Announcements", icon: Megaphone, path: "/teacher/announcements" },

  // Analytics
  {
    name: "Performance",
    icon: TrendingUp,
    path: "/teacher/analytics/performance",
  },
  {
    name: "Student Progress",
    icon: BarChart,
    path: "/teacher/analytics/progress",
  },

  // Profile
  { name: "Profile", icon: User, path: "/teacher/profile" },
  { name: "Schedule", icon: Calendar, path: "/teacher/schedule" },
  { name: "Reviews", icon: Star, path: "/teacher/reviews" },
];

export const moderatorNavItems = [
  // Dashboard
  { name: "Dashboard", icon: LayoutDashboard, path: "/moderator/dashboard" },

  // Assigned Batches
  { name: "My Batches", icon: Layers, path: "/moderator/batches" },
  { name: "Students", icon: Users, path: "/moderator/students" },
  { name: "Attendance", icon: CalendarCheck, path: "/moderator/attendance" },

  // Content Moderation
  { name: "Pending Posts", icon: Clock, path: "/moderator/posts/pending" },
  {
    name: "Reported Content",
    icon: AlertTriangle,
    path: "/moderator/reported",
  },
  { name: "Comments", icon: MessageCircle, path: "/moderator/comments" },
  { name: "Approve Notes", icon: FileCheck, path: "/moderator/notes" },

  // Support
  { name: "Doubts Queue", icon: HelpCircle, path: "/moderator/doubts" },
  { name: "Support Tickets", icon: Headset, path: "/moderator/support" },
  {
    name: "Announcements",
    icon: Megaphone,
    path: "/moderator/announcements",
  },

  // Communication
  {
    name: "Send Notifications",
    icon: Bell,
    path: "/moderator/notifications",
  },
  { name: "Messages", icon: Mail, path: "/moderator/messages" },

  // Reports
  {
    name: "Attendance Reports",
    icon: FileBarChart,
    path: "/moderator/reports/attendance",
  },
  { name: "Activity Logs", icon: Activity, path: "/moderator/logs" },

  // Profile
  { name: "Profile", icon: User, path: "/moderator/profile" },
  { name: "Settings", icon: Settings, path: "/moderator/settings" },
];

export const guardianNavItems = [
  // Dashboard
  { name: "Dashboard", icon: LayoutDashboard, path: "/guardian/dashboard" },

  // My Wards
  { name: "My Children", icon: Users, path: "/guardian/children" },
  { name: "Ward Details", icon: User, path: "/guardian/ward/:id" },

  // Academics
  { name: "Attendance", icon: CalendarCheck, path: "/guardian/attendance" },
  { name: "Exam Results", icon: Trophy, path: "/guardian/results" },
  { name: "Progress Reports", icon: BarChart, path: "/guardian/progress" },
  { name: "Assignments", icon: Clipboard, path: "/guardian/assignments" },

  // Schedule
  { name: "Class Schedule", icon: Calendar, path: "/guardian/schedule" },
  { name: "Upcoming Exams", icon: ScrollText, path: "/guardian/exams" },
  { name: "Holidays", icon: CalendarX, path: "/guardian/holidays" },

  // Communications
  { name: "Announcements", icon: Megaphone, path: "/guardian/announcements" },
  { name: "Messages", icon: Mail, path: "/guardian/messages" },
  { name: "Teacher Notes", icon: MessageSquare, path: "/guardian/notes" },
  { name: "Parent-Teacher Meetings", icon: Users, path: "/guardian/ptm" },

  // Fees
  { name: "Fee Details", icon: CreditCard, path: "/guardian/fees" },
  { name: "Payment History", icon: History, path: "/guardian/payments" },
  { name: "Due Payments", icon: AlertCircle, path: "/guardian/due-payments" },
  { name: "Download Receipts", icon: Download, path: "/guardian/receipts" },

  // Profile
  { name: "Profile", icon: User, path: "/guardian/profile" },
  { name: "Settings", icon: Settings, path: "/guardian/settings" },
];

export const studentNavItems = [
  // Dashboard
  { name: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },

  // My Learning
  { name: "My Batches", icon: Layers, path: "/student/my-batches" },
  { name: "Live Classes", icon: Video, path: "/student/live-classes" },
  { name: "Recorded Lectures", icon: Film, path: "/student/recordings" },
  { name: "Attendance", icon: CalendarCheck, path: "/student/attendance" },
  { name: "Timetable", icon: Clock, path: "/student/timetable" },

  // Study Materials
  { name: "Notes", icon: File, path: "/student/notes" },
  { name: "Assignments", icon: Clipboard, path: "/student/assignments" },
  { name: "Practice Problems", icon: PenTool, path: "/student/practice" },
  { name: "Formula Sheets", icon: Sigma, path: "/student/formulas" },

  // Assessments
  { name: "Quizzes", icon: HelpCircle, path: "/student/quizzes" },
  { name: "Exams", icon: ScrollText, path: "/student/exams" },
  { name: "Test Series", icon: Layers, path: "/student/test-series" },
  { name: "My Results", icon: Award, path: "/student/results" },

  // Interaction
  { name: "Ask Doubt", icon: MessageCircle, path: "/student/ask-doubt" },
  { name: "My Doubts", icon: HelpCircle, path: "/student/my-doubts" },
  { name: "Discussion Forum", icon: MessagesSquare, path: "/student/forum" },

  // Resources
  { name: "Blogs", icon: Newspaper, path: "/student/blogs" },
  { name: "Media Library", icon: Film, path: "/student/media" },
  { name: "Previous Papers", icon: Archive, path: "/student/papers" },

  // Progress
  { name: "My Progress", icon: TrendingUp, path: "/student/progress" },
  {
    name: "Performance Analysis",
    icon: BarChart,
    path: "/student/analytics",
  },
  { name: "Achievements", icon: Trophy, path: "/student/achievements" },
  { name: "Certificates", icon: Award, path: "/student/certificates" },

  // Payments
  { name: "Fee Details", icon: CreditCard, path: "/student/fees" },
  { name: "Payment History", icon: History, path: "/student/payments" },
  { name: "Invoices", icon: Receipt, path: "/student/invoices" },

  // Profile
  { name: "My Profile", icon: User, path: "/student/profile" },
  { name: "Settings", icon: Settings, path: "/student/settings" },
  { name: "Guardian Info", icon: Heart, path: "/student/guardian" },
];
