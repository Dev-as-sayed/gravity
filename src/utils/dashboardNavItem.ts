import {
  LayoutDashboard,
  Users,
  Heart,
  BookOpen,
  Layers,
  ClipboardList,
  FileText,
  Newspaper,
  HelpCircle,
  ScrollText,
  File,
  CreditCard,
  Headset,
  BarChart,
  FileBarChart,
  Activity,
  Settings,
  Video,
  CalendarCheck,
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
  AlertTriangle,
  FileCheck,
  Bell,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}



// Teacher Navigation Items
export const teacherNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/teacher" },
  { name: "My Batches", icon: Layers, path: "/dashboard/batches" },
  { name: "Live Sessions", icon: Video, path: "/dashboard/live-sessions" },
  { name: "Attendance", icon: CalendarCheck, path: "/dashboard/attendance" },
  { name: "Courses", icon: BookOpen, path: "/dashboard/courses" },
  { name: "Students", icon: Users, path: "/dashboard/students" },
  { name: "Enrollments", icon: ClipboardList, path: "/dashboard/enrollments" },
  { name: "Posts", icon: FileText, path: "/dashboard/posts" },
  { name: "Blogs", icon: Newspaper, path: "/dashboard/blogs" },
  { name: "Notes", icon: File, path: "/dashboard/notes" },
  { name: "Quizzes", icon: HelpCircle, path: "/dashboard/quizzes" },
  { name: "Exams", icon: ScrollText, path: "/dashboard/exams" },
  { name: "Assignments", icon: Clipboard, path: "/dashboard/assignments" },
  { name: "Quiz Results", icon: Award, path: "/dashboard/results/quizzes" },
  { name: "Exam Results", icon: Trophy, path: "/dashboard/results/exams" },
  { name: "Grade Assignments", icon: PenLine, path: "/dashboard/grade" },
  { name: "Doubt Solving", icon: MessageCircle, path: "/dashboard/doubts" },
  { name: "Announcements", icon: Megaphone, path: "/dashboard/announcements" },
  { name: "Analytics", icon: TrendingUp, path: "/dashboard/analytics/performance" },
  { name: "Profile", icon: User, path: "/dashboard/profile" },
  { name: "Schedule", icon: Calendar, path: "/dashboard/schedule" },
  { name: "Reviews", icon: Star, path: "/dashboard/reviews" },
];

// Student Navigation Items
export const studentNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/student" },
  { name: "My Batches", icon: Layers, path: "/dashboard/student/my-batches" },
  {
    name: "Live Classes",
    icon: Video,
    path: "/dashboard/student/live-classes",
  },
  {
    name: "Attendance",
    icon: CalendarCheck,
    path: "/dashboard/student/attendance",
  },
  { name: "Timetable", icon: Clock, path: "/dashboard/student/timetable" },
  { name: "Notes", icon: File, path: "/dashboard/student/notes" },
  {
    name: "Assignments",
    icon: Clipboard,
    path: "/dashboard/student/assignments",
  },
  { name: "Practice", icon: PenTool, path: "/dashboard/student/practice" },
  { name: "Formula Sheets", icon: Sigma, path: "/dashboard/student/formulas" },
  { name: "Quizzes", icon: HelpCircle, path: "/dashboard/student/quizzes" },
  { name: "Exams", icon: ScrollText, path: "/dashboard/student/exams" },
  { name: "Test Series", icon: Layers, path: "/dashboard/student/test-series" },
  { name: "My Results", icon: Award, path: "/dashboard/student/results" },
  { name: "Doubts", icon: MessageCircle, path: "/dashboard/student/my-doubts" },
  { name: "Forum", icon: MessagesSquare, path: "/dashboard/student/forum" },
  { name: "Blogs", icon: Newspaper, path: "/dashboard/student/blogs" },
  { name: "Media Library", icon: Film, path: "/dashboard/student/media" },
  { name: "Previous Papers", icon: Archive, path: "/dashboard/student/papers" },
  {
    name: "Progress",
    icon: TrendingUp,
    path: "/dashboard/student/progress",
  },
  {
    name: "Achievements",
    icon: Trophy,
    path: "/dashboard/student/achievements",
  },
  { name: "Fees", icon: CreditCard, path: "/dashboard/student/fees" },
  { name: "My Profile", icon: User, path: "/dashboard/student/profile" },
  { name: "Settings", icon: Settings, path: "/dashboard/student/settings" },
  { name: "Guardian Info", icon: Heart, path: "/dashboard/student/guardian" },
];

// Guardian Navigation Items
export const guardianNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/guardian/dashboard" },
  { name: "My Children", icon: Users, path: "/guardian/children" },
  { name: "Attendance", icon: CalendarCheck, path: "/guardian/attendance" },
  { name: "Exam Results", icon: Trophy, path: "/guardian/results" },
  { name: "Progress Reports", icon: BarChart, path: "/guardian/progress" },
  { name: "Assignments", icon: Clipboard, path: "/guardian/assignments" },
  { name: "Class Schedule", icon: Calendar, path: "/guardian/schedule" },
  { name: "Upcoming Exams", icon: ScrollText, path: "/guardian/exams" },
  { name: "Holidays", icon: CalendarX, path: "/guardian/holidays" },
  { name: "Announcements", icon: Megaphone, path: "/guardian/announcements" },
  { name: "Messages", icon: Mail, path: "/guardian/messages" },
  { name: "Teacher Notes", icon: MessageSquare, path: "/guardian/notes" },
  { name: "PTM", icon: Users, path: "/guardian/ptm" },
  { name: "Fees & Payments", icon: CreditCard, path: "/guardian/fees" },
  { name: "Profile", icon: User, path: "/guardian/profile" },
  { name: "Settings", icon: Settings, path: "/guardian/settings" },
];

// Moderator Navigation Items
export const moderatorNavItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard/dashboard" },
  { name: "My Batches", icon: Layers, path: "/dashboard/batches" },
  { name: "Students", icon: Users, path: "/dashboard/students" },
  { name: "Attendance", icon: CalendarCheck, path: "/dashboard/attendance" },
  { name: "Pending Posts", icon: Clock, path: "/dashboard/posts/pending" },
  {
    name: "Reported Content",
    icon: AlertTriangle,
    path: "/dashboard/reported",
  },
  { name: "Comments", icon: MessageCircle, path: "/dashboard/comments" },
  { name: "Approve Notes", icon: FileCheck, path: "/dashboard/notes" },
  { name: "Doubts Queue", icon: HelpCircle, path: "/dashboard/doubts" },
  { name: "Support Tickets", icon: Headset, path: "/dashboard/support" },
  { name: "Announcements", icon: Megaphone, path: "/dashboard/announcements" },
  { name: "Notifications", icon: Bell, path: "/dashboard/notifications" },
  { name: "Messages", icon: Mail, path: "/dashboard/messages" },
  {
    name: "Attendance Reports",
    icon: FileBarChart,
    path: "/dashboard/reports/attendance",
  },
  { name: "Activity Logs", icon: Activity, path: "/dashboard/logs" },
  { name: "Profile", icon: User, path: "/dashboard/profile" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

// Map role to navigation items
export const roleNavMap: Record<string, NavItem[]> = {
  TEACHER: teacherNavItems,
  STUDENT: studentNavItems,
  GUARDIAN: guardianNavItems,
  MODERATOR: moderatorNavItems,
};
