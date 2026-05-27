import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  console.log("Cleaning existing data...");
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.liveSessionAttendance.deleteMany();
  await prisma.liveSession.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.quizResult.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.postReaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.doubtAnswer.deleteMany();
  await prisma.doubt.deleteMany();
  await prisma.batchReview.deleteMany();
  await prisma.batchMaterial.deleteMany();
  await prisma.note.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.batchSession.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.student.deleteMany();
  await prisma.moderator.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleanup done.");

  const password = await hashPassword("Test@1234");

  // =========================================================
  // USERS
  // =========================================================
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@gravityphysics.com" },
    update: {},
    create: {
      id: "usr_teacher_001",
      email: "teacher@gravityphysics.com",
      password,
      phone: "+919876543211",
      role: "TEACHER",
      name: "Dr. Amit Sharma",
      bio: "Senior Physics Faculty, IIT Delhi Alumnus",
      address: "42 Academic Avenue, Saket",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110017",
      isVerified: true,
      emailVerified: true,
      phoneVerified: true,
      lastLogin: new Date("2026-05-26"),
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      id: "tch_001",
      userId: teacherUser.id,
      name: "Dr. Amit Sharma",
      bio: "PhD in Physics with 15+ years teaching experience. IIT Delhi alumnus.",
      qualification: "Ph.D. IIT Delhi, M.Sc. Physics",
      expertise: ["Physics", "Mathematics", "Quantum Mechanics", "Electrodynamics"],
      experience: 15,
      designation: "Senior Physics Faculty",
      institute: "Gravity Physics Academy",
      website: "https://gravityphysics.example.com",
      linkedin: "https://linkedin.com/in/dramitsharma",
      youtube: "https://youtube.com/@gravityphysics",
      totalStudents: 450,
      averageRating: 4.7,
      totalCourses: 5,
      totalBatches: 8,
      totalReviews: 120,
      settings: { theme: "dark", language: "en", timezone: "Asia/Kolkata" },
      officeHours: { monday: "10:00-12:00", wednesday: "14:00-16:00", friday: "10:00-12:00" },
    },
  });

  const modUser = await prisma.user.upsert({
    where: { email: "moderator@gravityphysics.com" },
    update: {},
    create: {
      id: "usr_mod_001",
      email: "moderator@gravityphysics.com",
      password,
      phone: "+919876543215",
      role: "MODERATOR",
      name: "Ankit Mehta",
      bio: "Content Moderator & Teaching Assistant",
      isVerified: true,
      emailVerified: true,
    },
  });

  await prisma.moderator.upsert({
    where: { userId: modUser.id },
    update: {},
    create: {
      id: "mod_001",
      userId: modUser.id,
      name: "Ankit Mehta",
      assignedBy: teacher.id,
      permissions: {
        canManageBatches: true, canManageAttendance: true,
        canManageDoubts: true, canManagePosts: true, canManageNotes: true,
      },
    },
  });

  const studentData = [
    { id: "usr_student_001", email: "rahul.sharma@email.com", name: "Rahul Sharma", phone: "+919876543301", sid: "std_001", institute: "Delhi Public School", cls: "12", board: "CBSE", targets: ["JEE Main", "JEE Advanced"], group: "Science", city: "New Delhi" },
    { id: "usr_student_002", email: "priya.patel@email.com", name: "Priya Patel", phone: "+919876543302", sid: "std_002", institute: "St. Xavier's College", cls: "12", board: "ICSE", targets: ["NEET"], group: "Science", city: "Mumbai" },
    { id: "usr_student_003", email: "akash.kumar@email.com", name: "Akash Kumar", phone: "+919876543303", sid: "std_003", institute: "Kendriya Vidyalaya", cls: "11", board: "CBSE", targets: ["JEE Main"], group: "Science", city: "Bangalore" },
    { id: "usr_student_004", email: "neha.verma@email.com", name: "Neha Verma", phone: "+919876543304", sid: "std_004", institute: "Army Public School", cls: "12", board: "CBSE", targets: ["JEE Advanced"], group: "Science", city: "Pune" },
    { id: "usr_student_005", email: "arjun.singh@email.com", name: "Arjun Singh", phone: "+919876543305", sid: "std_005", institute: "DAV Public School", cls: "12", board: "CBSE", targets: ["JEE Main", "JEE Advanced", "BITSAT"], group: "Science", city: "Lucknow" },
    { id: "usr_student_006", email: "sneha.reddy@email.com", name: "Sneha Reddy", phone: "+919876543306", sid: "std_006", institute: "Fiitjee Junior College", cls: "12", board: "Telangana State", targets: ["JEE Advanced", "NEET"], group: "Science", city: "Hyderabad" },
    { id: "usr_student_007", email: "vikram.joshi@email.com", name: "Vikram Joshi", phone: "+919876543307", sid: "std_007", institute: "Delhi Public School", cls: "11", board: "CBSE", targets: ["JEE Main"], group: "Science", city: "New Delhi" },
    { id: "usr_student_008", email: "ananya.gupta@email.com", name: "Ananya Gupta", phone: "+919876543308", sid: "std_008", institute: "National Public School", cls: "12", board: "CBSE", targets: ["NEET", "AIIMS"], group: "Science", city: "Kolkata" },
    { id: "usr_student_009", email: "rohan.deshpande@email.com", name: "Rohan Deshpande", phone: "+919876543309", sid: "std_009", institute: "Bishop's School", cls: "11", board: "ICSE", targets: ["JEE Main", "JEE Advanced"], group: "Science", city: "Pune" },
    { id: "usr_student_010", email: "ishita.bose@email.com", name: "Ishita Bose", phone: "+919876543310", sid: "std_010", institute: "South Point School", cls: "12", board: "CBSE", targets: ["NEET"], group: "Science", city: "Kolkata" },
    { id: "usr_student_011", email: "karan.malhotra@email.com", name: "Karan Malhotra", phone: "+919876543311", sid: "std_011", institute: "DAV College", cls: "12", board: "CBSE", targets: ["JEE Advanced"], group: "Science", city: "Chandigarh" },
    { id: "usr_student_012", email: "divya.nair@email.com", name: "Divya Nair", phone: "+919876543312", sid: "std_012", institute: "Kendriya Vidyalaya", cls: "11", board: "CBSE", targets: ["JEE Main", "NEET"], group: "Science", city: "Thiruvananthapuram" },
  ];

  const studentIds: string[] = [];
  for (const s of studentData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        id: s.id, email: s.email, password, phone: s.phone,
        role: "STUDENT", name: s.name, isVerified: true, emailVerified: true,
        city: s.city, state: "India",
      },
    });
    const st = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: s.sid, userId: user.id, name: s.name,
        institute: s.institute, class: s.cls, board: s.board,
        examTargets: s.targets, group: s.group, city: s.city,
        learningGoals: ["Master Physics", "Improve Problem Solving"],
        preferredSubjects: ["Physics", "Mathematics"],
      },
    });
    studentIds.push(st.id);
  }

  const guardianData = [
    { id: "usr_guardian_001", email: "parent.sharma@email.com", name: "Mr. Sharma", phone: "+919876543401", gid: "grd_001", rel: "Father", occ: "Engineer", inc: 1500000, studentIdx: 0 },
    { id: "usr_guardian_002", email: "parent.patel@email.com", name: "Mrs. Patel", phone: "+919876543402", gid: "grd_002", rel: "Mother", occ: "Doctor", inc: 2000000, studentIdx: 1 },
    { id: "usr_guardian_003", email: "parent.gupta@email.com", name: "Mr. Gupta", phone: "+919876543403", gid: "grd_003", rel: "Father", occ: "Business", inc: 3000000, studentIdx: 7 },
    { id: "usr_guardian_004", email: "parent.deshpande@email.com", name: "Mrs. Deshpande", phone: "+919876543404", gid: "grd_004", rel: "Mother", occ: "Professor", inc: 1800000, studentIdx: 8 },
  ];

  const guardianIds: string[] = [];
  for (const g of guardianData) {
    const user = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: {
        id: g.id, email: g.email, password, phone: g.phone,
        role: "GUARDIAN", name: g.name, isVerified: true,
      },
    });
    const grd = await prisma.guardian.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: g.gid, userId: user.id, name: g.name,
        relationship: g.rel, occupation: g.occ, income: g.inc,
      },
    });
    guardianIds.push(grd.id);
    // Link to student
    await prisma.student.update({
      where: { id: studentData[g.studentIdx].sid },
      data: { guardianId: grd.id },
    });
  }

  // =========================================================
  // COURSES & BATCHES
  // =========================================================
  const courseData = [
    { id: "crs_001", title: "Complete Physics for JEE Advanced", slug: "complete-physics-jee-advanced", price: 25000, level: "ADVANCED" as const, duration: 200, desc: "Master all Physics topics for JEE Advanced with comprehensive coverage of Mechanics, Electrodynamics, Optics, and Modern Physics.", subject: "Physics", category: "Science", outcomes: ["Solve JEE Advanced level problems", "Master calculus-based physics", "Develop intuition for physical systems"] },
    { id: "crs_002", title: "NEET Physics Crash Course", slug: "neet-physics-crash-course", price: 12000, level: "INTERMEDIATE" as const, duration: 40, desc: "Rapid revision course covering all NEET Physics topics with MCQs and previous year questions.", subject: "Physics", category: "Science", outcomes: ["Master NEET Physics syllabus", "Solve 1000+ MCQs", "Time management strategies"] },
    { id: "crs_003", title: "Free Physics Fundamentals", slug: "free-physics-fundamentals", price: 0, isFree: true, level: "BEGINNER" as const, duration: 20, desc: "Build a strong foundation in basic Physics concepts for absolute beginners.", subject: "Physics", category: "Science", outcomes: ["Understand basic Physics concepts", "Ace school exams", "Build problem-solving foundation"] },
    { id: "crs_004", title: "Mathematics for Physics", slug: "mathematics-for-physics", price: 15000, level: "ADVANCED" as const, duration: 120, desc: "Essential mathematical tools for Physics including calculus, vectors, and differential equations.", subject: "Mathematics", category: "Science", outcomes: ["Master vector calculus", "Solve differential equations", "Apply linear algebra to Physics"] },
    { id: "crs_005", title: "Experimental Physics & Viva Prep", slug: "experimental-physics-viva", price: 8000, level: "INTERMEDIATE" as const, duration: 30, desc: "Learn experimental techniques and prepare for viva voce examinations.", subject: "Physics", category: "Science", outcomes: ["Understand lab equipment", "Analyze experimental data", "Prepare for viva exams"] },
  ];

  for (const c of courseData) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        id: c.id, title: c.title, slug: c.slug, description: c.desc,
        subject: c.subject, category: c.category, teacherId: teacher.id,
        price: c.price, isFree: ("isFree" in c ? c.isFree : false) as boolean,
        level: c.level, duration: c.duration,
        learningOutcomes: c.outcomes,
        metaTitle: c.title, metaDescription: c.desc,
      },
    });
  }

  const batchData = [
    { id: "bch_001", name: "JEE Advanced 2026 - Morning Batch", slug: "jee-advanced-2026-morning", courseId: "crs_001", price: 25000, max: 60, mode: "ONLINE" as const, start: new Date("2026-04-01"), sessions: [{ name: "Morning", days: ["monday", "wednesday", "friday"], startTime: "06:00", endTime: "08:00" }] },
    { id: "bch_002", name: "JEE Advanced 2026 - Evening Batch", slug: "jee-advanced-2026-evening", courseId: "crs_001", price: 25000, max: 50, mode: "ONLINE" as const, start: new Date("2026-04-01"), sessions: [{ name: "Evening", days: ["tuesday", "thursday", "saturday"], startTime: "18:00", endTime: "20:00" }] },
    { id: "bch_003", name: "NEET Physics - Crash Course Apr", slug: "neet-physics-crash-apr", courseId: "crs_002", price: 12000, max: 40, mode: "ONLINE" as const, start: new Date("2026-04-15"), sessions: [{ name: "Afternoon", days: ["monday", "wednesday", "friday"], startTime: "14:00", endTime: "16:00" }] },
    { id: "bch_004", name: "Free Physics - Weekend Batch", slug: "free-physics-weekend", courseId: "crs_003", price: 0, max: 100, mode: "ONLINE" as const, start: new Date("2026-05-01"), sessions: [{ name: "Morning", days: ["saturday", "sunday"], startTime: "10:00", endTime: "12:00" }] },
    { id: "bch_005", name: "Math for Physics - Intensive", slug: "math-physics-intensive", courseId: "crs_004", price: 15000, max: 35, mode: "HYBRID" as const, start: new Date("2026-05-01"), sessions: [{ name: "Evening", days: ["monday", "tuesday", "thursday"], startTime: "16:00", endTime: "18:00" }] },
    { id: "bch_006", name: "JEE Advanced 2027 - Foundation Batch", slug: "jee-advanced-2027-foundation", courseId: "crs_001", price: 20000, max: 45, mode: "ONLINE" as const, start: new Date("2026-06-01"), sessions: [{ name: "Morning", days: ["tuesday", "thursday", "saturday"], startTime: "06:00", endTime: "08:00" }] },
    { id: "bch_007", name: "Viva & Experimental Physics", slug: "experimental-physics", courseId: "crs_005", price: 8000, max: 25, mode: "OFFLINE" as const, start: new Date("2026-05-15"), sessions: [{ name: "Morning", days: ["wednesday", "friday"], startTime: "10:00", endTime: "12:00" }], lang: "English" },
    { id: "bch_008", name: "NEET Physics - Evening Crash", slug: "neet-physics-evening-crash", courseId: "crs_002", price: 12000, max: 35, mode: "ONLINE" as const, start: new Date("2026-05-01"), sessions: [{ name: "Evening", days: ["tuesday", "thursday", "saturday"], startTime: "18:00", endTime: "20:00" }] },
  ];

  for (const b of batchData) {
    const { sessions: bSessions, ...batchFields } = b;
    await prisma.batch.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        id: b.id, name: b.name, slug: b.slug,
        courseId: b.courseId, teacherId: teacher.id,
        subject: "Physics", mode: b.mode, language: "lang" in b ? b.lang : "English",
        startDate: b.start, price: b.price,
        maxStudents: b.max, currentEnrollments: 0,
        enrollmentOpen: true, isPublished: true, isActive: true,
        totalClasses: 120, completedClasses: Math.floor(Math.random() * 30),
      },
    });

    // Create sessions for this batch
    if (bSessions) {
      const existingSessions = await prisma.batchSession.findMany({ where: { batchId: b.id } });
      if (existingSessions.length === 0) {
        await prisma.batchSession.createMany({
          data: bSessions.map((s) => ({
            batchId: b.id, name: s.name,
            days: s.days, startTime: s.startTime, endTime: s.endTime,
          })),
        });
      }
    }
  }

  const batchIds = batchData.map(b => b.id);

  // =========================================================
  // ENROLLMENTS & PAYMENTS
  // =========================================================
  const enrollmentPairs: { studentId: string; batchId: string }[] = [];
  // Enroll first 8 students in various batches
  const enrollmentPlan = [
    [0, 0], [0, 1], [1, 2], [1, 7], [2, 0], [2, 5], [3, 1], [4, 0], [4, 4], [5, 2],
    [5, 3], [6, 5], [6, 4], [7, 2], [7, 7], [8, 4], [8, 6], [9, 2], [9, 3], [10, 0],
    [10, 1], [11, 3], [11, 5],
  ];
  const statuses = ["APPROVED", "APPROVED", "APPROVED", "APPROVED", "COMPLETED", "PENDING"] as const;

  for (const [si, bi] of enrollmentPlan) {
    const stdId = studentData[si].sid;
    const bchId = batchIds[bi];
    enrollmentPairs.push({ studentId: stdId, batchId: bchId });

    const enrolledAt = randomDate(new Date("2026-03-01"), new Date("2026-05-01"));
    const status = pick(statuses);

    const enrollment = await prisma.enrollment.upsert({
      where: { studentId_batchId: { studentId: stdId, batchId: bchId } },
      update: {},
      create: {
        studentId: stdId, batchId: bchId,
        status, totalFees: batchData[bi].price,
        paidAmount: status === "COMPLETED" ? batchData[bi].price : status === "PENDING" ? 0 : batchData[bi].price,
        dueAmount: status === "COMPLETED" ? 0 : batchData[bi].price,
        appliedAt: enrolledAt,
        approvedAt: status !== "PENDING" ? new Date(enrolledAt.getTime() + 86400000) : null,
        progressPercentage: Math.floor(Math.random() * 80) + 10,
        classesAttended: Math.floor(Math.random() * 40),
        totalClasses: 60, assignmentsDone: Math.floor(Math.random() * 10),
        averageScore: Math.random() * 100,
        scholarshipAmount: si === 8 ? 2000 : 0,
        scholarshipReason: si === 8 ? "Merit cum means" : null,
      },
    });

    // Payments for approved enrollments
    if (status !== "PENDING" && batchData[bi].price > 0) {
      const now = new Date();
      await prisma.payment.create({
        data: {
          enrollmentId: enrollment.id, studentId: stdId,
          amount: batchData[bi].price, paidAmount: batchData[bi].price,
          dueAmount: 0, tax: Math.round(batchData[bi].price * 0.18),
          totalAmount: Math.round(batchData[bi].price * 1.18),
          method: pick(["ONLINE", "CARD", "UPI", "NET_BANKING"]),
          status: "COMPLETED",
          transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
          paymentGateway: pick(["Razorpay", "Stripe", "SSLCommerz"]),
          paymentDate: randomDate(new Date("2026-03-01"), now),
          invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          cardLast4: String(1000 + Math.floor(Math.random() * 9000)),
          cardBrand: pick(["Visa", "Mastercard", "RuPay"]),
        },
      });
    }
  }

  // =========================================================
  // QUIZZES & QUESTIONS
  // =========================================================
  const quizData = [
    { id: "qz_001", title: "Kinematics Basics", slug: "kinematics-basics", batchIdx: 0, marks: 30, pass: 15, time: 30, diff: "BEGINNER" as const, subject: "Physics", topic: "Kinematics" },
    { id: "qz_002", title: "Newton's Laws of Motion", slug: "newtons-laws", batchIdx: 1, marks: 40, pass: 20, time: 45, diff: "INTERMEDIATE" as const, subject: "Physics", topic: "Dynamics" },
    { id: "qz_003", title: "Electrostatics Quiz", slug: "electrostatics-quiz", batchIdx: 0, marks: 50, pass: 25, time: 60, diff: "ADVANCED" as const, subject: "Physics", topic: "Electrostatics" },
    { id: "qz_004", title: "NEET Thermodynamics", slug: "neet-thermodynamics", batchIdx: 2, marks: 25, pass: 12, time: 30, diff: "INTERMEDIATE" as const, subject: "Physics", topic: "Thermodynamics" },
    { id: "qz_005", title: "Optics Mock Test", slug: "optics-mock", batchIdx: 5, marks: 60, pass: 30, time: 75, diff: "ADVANCED" as const, subject: "Physics", topic: "Optics" },
    { id: "qz_006", title: "Modern Physics Revision", slug: "modern-physics-revision", batchIdx: 7, marks: 35, pass: 18, time: 40, diff: "INTERMEDIATE" as const, subject: "Physics", topic: "Modern Physics" },
  ];

  const mcqTemplates = [
    { q: "What is the SI unit of force?", opts: ["Newton", "Joule", "Watt", "Pascal"], ans: 0 },
    { q: "The acceleration due to gravity at Earth's surface is approximately:", opts: ["9.8 m/s²", "8.9 m/s²", "10.2 m/s²", "9.0 m/s²"], ans: 0 },
    { q: "Which law states that energy cannot be created or destroyed?", opts: ["Newton's First Law", "Law of Conservation of Energy", "Ohm's Law", "Boyle's Law"], ans: 1 },
    { q: "What is the speed of light in vacuum?", opts: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁵ m/s"], ans: 1 },
    { q: "The unit of electric current is:", opts: ["Volt", "Ampere", "Ohm", "Coulomb"], ans: 1 },
    { q: "Which of the following is a scalar quantity?", opts: ["Velocity", "Force", "Energy", "Acceleration"], ans: 2 },
    { q: "What is the boiling point of water in Celsius?", opts: ["90°C", "100°C", "110°C", "120°C"], ans: 1 },
    { q: "The resistance of a conductor depends on:", opts: ["Length only", "Area only", "Material only", "Length, area, and material"], ans: 3 },
    { q: "Which particle has no charge?", opts: ["Proton", "Electron", "Neutron", "Ion"], ans: 2 },
    { q: "What is the frequency of AC in India?", opts: ["40 Hz", "50 Hz", "60 Hz", "100 Hz"], ans: 1 },
    { q: "The focal length of a convex lens is:", opts: ["Always positive", "Always negative", "Zero", "Infinite"], ans: 0 },
    { q: "Which of the following is NOT a type of nuclear reaction?", opts: ["Fission", "Fusion", "Diffraction", "Radioactive decay"], ans: 2 },
    { q: "The escape velocity from Earth is approximately:", opts: ["7 km/s", "9.8 km/s", "11.2 km/s", "15 km/s"], ans: 2 },
    { q: "What is the principle of a transformer?", opts: ["Electromagnetic induction", "Electrolysis", "Thermionic emission", "Photoelectric effect"], ans: 0 },
    { q: "The dimensional formula of Planck's constant is:", opts: ["[ML²T⁻¹]", "[ML²T⁻²]", "[ML²T⁻³]", "[ML¹T⁻¹]"], ans: 0 },
    { q: "Which gas has the highest specific heat?", opts: ["Oxygen", "Hydrogen", "Nitrogen", "Helium"], ans: 1 },
    { q: "The angle between electric field and equipotential surface is:", opts: ["0°", "45°", "90°", "180°"], ans: 2 },
    { q: "Which device converts AC to DC?", opts: ["Transformer", "Rectifier", "Amplifier", "Oscillator"], ans: 1 },
    { q: "The phenomenon of light bending around obstacles is called:", opts: ["Refraction", "Diffraction", "Reflection", "Dispersion"], ans: 1 },
    { q: "What is the atomic number of Carbon?", opts: ["4", "6", "8", "12"], ans: 1 },
    { q: "The SI unit of capacitance is:", opts: ["Farad", "Henry", "Tesla", "Weber"], ans: 0 },
    { q: "Which color has the longest wavelength?", opts: ["Violet", "Blue", "Green", "Red"], ans: 3 },
    { q: "The rate of change of velocity is called:", opts: ["Speed", "Acceleration", "Momentum", "Force"], ans: 1 },
    { q: "What is the value of absolute zero in Celsius?", opts: ["-100°C", "-200°C", "-273.15°C", "-300°C"], ans: 2 },
    { q: "Which law is also known as the law of inertia?", opts: ["Newton's First Law", "Newton's Second Law", "Newton's Third Law", "Law of Gravitation"], ans: 0 },
  ];

  for (const q of quizData) {
    const quiz = await prisma.quiz.upsert({
      where: { slug: q.slug },
      update: {},
      create: {
        id: q.id, title: q.title, slug: q.slug,
        description: `${q.title} - ${q.diff} level quiz on ${q.topic}`,
        teacherId: teacher.id, batchId: batchIds[q.batchIdx],
        timeLimit: q.time, totalMarks: q.marks, passingMarks: q.pass,
        status: "PUBLISHED", isActive: true,
        difficulty: q.diff, subject: q.subject, topics: [q.topic],
        showResult: true, showAnswer: true, showExplanation: true,
        showLeaderboard: true, allowRetake: false, maxAttempts: 1,
        startTime: new Date("2026-04-01"), endTime: new Date("2026-12-31"),
      },
    });

    // Create 5 questions per quiz
    const shuffled = [...mcqTemplates].sort(() => Math.random() - 0.5).slice(0, 5);
    for (let i = 0; i < shuffled.length; i++) {
      await prisma.question.create({
        data: {
          quizId: quiz.id, text: shuffled[i].q, type: "MCQ",
          options: shuffled[i].opts, correctAnswer: shuffled[i].ans,
          marks: Math.floor(q.marks / shuffled.length), negativeMarks: 0,
          difficulty: q.diff, topic: q.topic, order: i + 1,
        },
      });
    }
  }

  // =========================================================
  // QUIZ ATTEMPTS & RESULTS
  // =========================================================
  for (let si = 0; si < Math.min(8, studentIds.length); si++) {
    for (let qi = 0; qi < Math.min(3, quizData.length); qi++) {
      const q = quizData[qi];
      // Check if student is enrolled in this batch
      const isEnrolled = enrollmentPairs.some(
        ep => ep.studentId === studentData[si].sid && ep.batchId === batchIds[q.batchIdx]
      );
      if (!isEnrolled) continue;

      const score = Math.floor(Math.random() * q.marks);
      const pct = (score / q.marks) * 100;

      const attempt = await prisma.quizAttempt.create({
        data: {
          quizId: q.id, studentId: studentData[si].sid,
          attemptNumber: 1, startTime: new Date("2026-04-10"),
          endTime: new Date("2026-04-10"), score, percentage: pct,
          isPassed: score >= q.pass, isCompleted: true,
          timeSpent: Math.floor(Math.random() * q.time! * 60),
        },
      });

      await prisma.quizResult.create({
        data: {
          attemptId: attempt.id, studentId: studentData[si].sid,
          quizId: q.id, totalMarks: q.marks, obtainedMarks: score,
          percentage: pct, rank: Math.floor(Math.random() * 30) + 1,
          totalParticipants: 25, weakTopics: ["Thermodynamics"],
          strongTopics: ["Kinematics"], timeAnalysis: { avg: q.time },
        },
      });
    }
  }

  // =========================================================
  // EXAMS & RESULTS
  // =========================================================
  const examData = [
    { id: "exm_001", title: "Weekly Test 1 - Mechanics", slug: "weekly-test-1", batchIdx: 0, marks: 100, pass: 35, dur: 180, type: "Weekly", subject: "Physics", date: new Date("2026-04-15") },
    { id: "exm_002", title: "Monthly Assessment - April", slug: "monthly-apr", batchIdx: 1, marks: 150, pass: 50, dur: 240, type: "Monthly", subject: "Physics", date: new Date("2026-04-30") },
    { id: "exm_003", title: "NEET Mock Test 1", slug: "neet-mock-1", batchIdx: 2, marks: 180, pass: 60, dur: 180, type: "Mock", subject: "Physics", date: new Date("2026-05-10") },
    { id: "exm_004", title: "Model Test - Full Syllabus", slug: "model-test-full", batchIdx: 5, marks: 200, pass: 70, dur: 300, type: "Model Test", subject: "Physics", date: new Date("2026-05-20") },
  ];

  for (const e of examData) {
    await prisma.exam.upsert({
      where: { slug: e.slug },
      update: {},
      create: {
        id: e.id, title: e.title, slug: e.slug,
        description: `${e.title} for ${e.type}`,
        teacherId: teacher.id, batchId: batchIds[e.batchIdx],
        type: e.type, subject: e.subject, fullMarks: e.marks, passMarks: e.pass,
        examDate: e.date, startTime: new Date(e.date.getTime() + 32400000),
        endTime: new Date(e.date.getTime() + 32400000 + e.dur * 60000),
        duration: e.dur, status: "RESULT_PUBLISHED", isResultPublished: true,
        gradingType: "AUTO", showRank: true, showPercentile: true,
      },
    });

    // Create results for enrolled students
    for (let si = 0; si < Math.min(6, studentIds.length); si++) {
      if (!enrollmentPairs.some(ep => ep.studentId === studentData[si].sid && ep.batchId === batchIds[e.batchIdx])) continue;
      const obtained = Math.floor(Math.random() * e.marks * 0.9) + e.marks * 0.1;
      await prisma.examResult.create({
        data: {
          examId: e.id, studentId: studentData[si].sid,
          obtainedMarks: obtained, totalMarks: e.marks,
          percentage: (obtained / e.marks) * 100,
          grade: obtained >= e.marks * 0.9 ? "A+" : obtained >= e.marks * 0.75 ? "A" : obtained >= e.marks * 0.6 ? "B" : "C",
          rank: Math.floor(Math.random() * 40) + 1,
          subjectWiseMarks: { physics: obtained * 0.6, chemistry: obtained * 0.4 },
          feedback: "Good attempt! Focus on problem-solving speed.",
        },
      });
    }
  }

  // =========================================================
  // POSTS & COMMENTS & REACTIONS
  // =========================================================
  const postContent = [
    { title: "Newton's Laws - Visual Guide", content: "Key concepts of Newton's Laws explained with real-life examples. First Law: Inertia. Second Law: F=ma. Third Law: Action-Reaction.", type: "TEXT" as const, visibility: "PUBLIC" as const },
    { title: "Optics: Ray Diagrams", content: "Complete guide to drawing ray diagrams for convex and concave lenses. Includes step-by-step instructions.", type: "IMAGE" as const, visibility: "PUBLIC" as const },
    { title: "Thermodynamics Formula Sheet", content: "Essential formulas for NEET: PV=nRT, ΔU=Q-W, efficiency of heat engines.", type: "PDF" as const, visibility: "PUBLIC" as const },
    { title: "JEE Advanced 2026 Strategy", content: "How to prepare for JEE Advanced 2026 in 6 months. Topic-wise weightage and study plan.", type: "TEXT" as const, visibility: "STUDENTS_ONLY" as const },
    { title: "Mock Test Analysis", content: "Detailed analysis of our first mock test. Common mistakes and how to avoid them.", type: "TEXT" as const, visibility: "BATCH_ONLY" as const },
    { title: "Electrostatics Mind Map", content: "Complete mind map covering Coulomb's law, electric field, potential, Gauss law, and capacitors.", type: "IMAGE" as const, visibility: "PUBLIC" as const },
    { title: "Study Tips from Toppers", content: "Tips from IIT toppers on how to manage time and stay motivated during preparation.", type: "VIDEO" as const, visibility: "PUBLIC" as const },
    { title: "DOUBT: Is E=mc² always valid?", content: "Einstein's mass-energy equivalence explained in simple terms with examples from nuclear physics.", type: "TEXT" as const, visibility: "PUBLIC" as const },
    { title: "Weekly Quiz Results", content: "Congratulations to top scorers in this week's kinematics quiz!", type: "TEXT" as const, visibility: "BATCH_ONLY" as const },
    { title: "Important Announcement: Schedule Change", content: "Due to exams, the morning batch will shift to 7 AM starting next week.", type: "TEXT" as const, visibility: "BATCH_ONLY" as const },
  ];

  for (let i = 0; i < postContent.length; i++) {
    const p = postContent[i];
    const post = await prisma.post.create({
      data: {
        id: `post_${String(i + 1).padStart(3, "0")}`,
        title: p.title, content: p.content, slug: `post-${i + 1}-${Date.now()}`,
        excerpt: p.content.slice(0, 80), type: p.type, status: "PUBLISHED",
        visibility: p.visibility, teacherId: teacher.id,
        batchId: i >= 4 && i <= 8 ? pick(batchIds) : null,
        isFeatured: i < 3, tags: ["Physics", "Study", i < 3 ? "Featured" : ""].filter(Boolean),
        topics: ["Mechanics", "Optics", "Thermodynamics"].slice(i % 3, i % 3 + 1),
        views: Math.floor(Math.random() * 500) + 10, uniqueViews: Math.floor(Math.random() * 200) + 5,
        shares: Math.floor(Math.random() * 30), publishedAt: randomDate(new Date("2026-03-01"), new Date()),
      },
    });

    // Comments on posts
    const commentCount = Math.floor(Math.random() * 4) + 1;
    for (let c = 0; c < commentCount; c++) {
      const si = Math.floor(Math.random() * studentIds.length);
      await prisma.comment.create({
        data: {
          content: pick(["Great explanation!", "Very helpful, thanks!", "Can you explain this in more detail?", "This cleared my doubt.", "Please share more resources on this topic.", "Excellent visualization!"]),
          postId: post.id, studentId: studentData[si].sid,
          status: "ACTIVE", createdAt: randomDate(new Date("2026-03-01"), new Date()),
        },
      });
    }

    // Reactions on post
    for (let r = 0; r < Math.floor(Math.random() * 5) + 1; r++) {
      const si = Math.floor(Math.random() * studentIds.length);
      try {
        await prisma.postReaction.create({
          data: {
            postId: post.id, studentId: studentData[si].sid,
            type: pick(["LIKE", "LOVE", "HELPFUL", "INSIGHTFUL", "CELEBRATE"]),
          },
        });
      } catch {
        // Skip duplicate
      }
    }
  }

  // =========================================================
  // DOUBTS & ANSWERS
  // =========================================================
  const doubtData = [
    { title: "Confused about centripetal force", desc: "Why does centripetal force always point toward the center? What happens if it stops?", idx: 0 },
    { title: "Kirchhoff's loop rule", desc: "How do we determine the sign when applying KVL across a battery with multiple loops?", idx: 1 },
    { title: "Photoelectric effect question", desc: "If intensity increases but frequency remains same, does stopping potential change?", idx: 2 },
    { title: "Lenz's law application", desc: "I'm unable to understand the direction of induced current in a moving magnet near a coil.", idx: 3 },
    { title: "SHM vs Circular Motion", desc: "Is simple harmonic motion really just a projection of uniform circular motion? Please elaborate with equations.", idx: 4 },
    { title: "Young's Double Slit", desc: "How does the fringe width change when we place the entire apparatus in water?", idx: 5 },
    { title: "RC Circuit time constant", desc: "Why does the capacitor charge to 63% after one time constant? How is τ = RC derived?", idx: 6 },
  ];

  for (let i = 0; i < doubtData.length; i++) {
    const d = doubtData[i];
    const doubt = await prisma.doubt.create({
      data: {
        id: `dbt_${String(i + 1).padStart(3, "0")}`,
        title: d.title, description: d.desc,
        studentId: studentData[d.idx].sid,
        batchId: pick(batchIds), subject: "Physics",
        topic: pick(["Mechanics", "Electrodynamics", "Optics", "Thermodynamics", "Modern Physics"]),
        status: pick(["ANSWERED", "RESOLVED"] as const),
        priority: pick(["LOW", "MEDIUM", "HIGH"]),
        assignedTo: teacher.id,
        tags: ["doubt", "physics", "neet-jee"],
        viewCount: Math.floor(Math.random() * 50) + 5, upvoteCount: Math.floor(Math.random() * 10),
        createdAt: randomDate(new Date("2026-03-01"), new Date()),
      },
    });

    // Answer for each doubt
    await prisma.doubtAnswer.create({
      data: {
        doubtId: doubt.id, teacherId: teacher.id,
        content: pick([
          "Great question! Let me explain step by step. The centripetal force is required to keep an object moving in a circular path. Without it, the object would fly off tangentially due to inertia. Think of swinging a ball tied to a string - the tension in the string provides the centripetal force. If the string breaks, the ball flies off tangentially.",
          "For KVL, the key rule is: when traversing from negative to positive terminal of a battery, consider it as +V. From positive to negative, it's -V. For resistors, if current direction matches traversal direction, it's -IR; otherwise +IR. The sum of all potential differences in a closed loop must equal zero.",
          "The stopping potential depends ONLY on the frequency of incident light, not its intensity. Increasing intensity increases the number of photoelectrons (current) but does NOT change the maximum kinetic energy (stopping potential). This was a key insight from Einstein's photoelectric equation.",
          "Use Lenz's law: the induced current creates a magnetic field that OPPOSES the change causing it. If a north pole approaches a coil, the induced current creates a north pole facing the approaching magnet (repulsion). If the north pole moves away, the induced current creates a south pole (attraction).",
          "Yes, SHM is exactly the projection of uniform circular motion. If a particle moves in a circle with constant angular velocity ω, its projection on the diameter executes SHM with the same ω. The displacement is x = A cos(ωt + φ), which is the x-coordinate of the circular motion.",
          "When the apparatus is placed in water, the wavelength of light decreases (λ' = λ/n). Since fringe width β = λD/d, it also decreases by a factor of n. So the fringes become closer together in water.",
          "The derivation comes from solving the differential equation for RC circuit: dQ/dt = (V - Q/C)/R. The solution is Q = CV(1 - e^(-t/RC)). At t = RC, Q = CV(1 - e^(-1)) = CV(1 - 0.3679) = 0.6321 CV, which is 63% of the maximum charge.",
        ]),
        isOfficial: true, isAccepted: true,
        createdAt: new Date(new Date(doubt.createdAt).getTime() + 3600000),
      },
    });

    // Update doubt resolution
    await prisma.doubt.update({
      where: { id: doubt.id },
      data: { resolvedAt: new Date(), resolvedBy: teacher.id },
    });
  }

  // =========================================================
  // ATTENDANCE
  // =========================================================
  for (const ep of enrollmentPairs.slice(0, 10)) {
    for (let day = 0; day < 10; day++) {
      const date = new Date("2026-04-01");
      date.setDate(date.getDate() + day * 2);
      try {
        await prisma.attendance.create({
          data: {
            studentId: ep.studentId, batchId: ep.batchId,
            date, status: pick(["PRESENT", "PRESENT", "PRESENT", "ABSENT", "LATE"]),
            checkInTime: new Date(date.getTime() + 36000000),
            checkOutTime: new Date(date.getTime() + 39600000),
            duration: 60, markedBy: teacher.id, verified: true,
          },
        });
      } catch {
        // Skip duplicate (unique on studentId + batchId + date)
      }
    }
  }

  // =========================================================
  // LIVE SESSIONS
  // =========================================================
  for (let i = 0; i < 6; i++) {
    const bi = i % batchIds.length;
    const sessionDate = new Date("2026-04-05");
    sessionDate.setDate(sessionDate.getDate() + i * 7);
    const session = await prisma.liveSession.create({
      data: {
        id: `ls_${String(i + 1).padStart(3, "0")}`,
        title: pick(["Kinematics Review", "Newton's Laws Deep Dive", "Work-Energy Theorem", "Rotational Motion", "Gravitation", "Simple Harmonic Motion"]),
        description: "Interactive live session covering key concepts with problem-solving.",
        teacherId: teacher.id, batchId: batchIds[bi],
        startTime: sessionDate, endTime: new Date(sessionDate.getTime() + 7200000),
        duration: 120, platform: "Zoom", meetingUrl: `https://zoom.us/j/gravity${i + 1}`,
        meetingId: `${9876000000 + i}`, meetingPassword: `Gravity${i + 1}`,
        isCompleted: i < 4, isLive: i === 4, isRecorded: i < 4,
        recordingAvailable: i < 4,
        recordingUrl: i < 4 ? `https://gravityphysics.example.com/recordings/session${i + 1}` : null,
      },
    });

    // Attendance for past sessions
    if (i < 4) {
      for (const ep of enrollmentPairs.filter(ep => ep.batchId === batchIds[bi]).slice(0, 5)) {
        await prisma.liveSessionAttendance.create({
          data: {
            sessionId: session.id, studentId: ep.studentId,
            joinedAt: sessionDate, leftAt: new Date(sessionDate.getTime() + 7200000),
            duration: 7000, isPresent: true,
          },
        });
      }
    }
  }

  // =========================================================
  // ASSIGNMENTS & SUBMISSIONS
  // =========================================================
  for (let i = 0; i < 6; i++) {
    const bi = i % batchIds.length;
    const assignment = await prisma.assignment.create({
      data: {
        id: `asn_${String(i + 1).padStart(3, "0")}`,
        title: pick(["Problem Set 1: Kinematics", "Numericals: Forces", "Practice: Work & Energy", "Assignment: Rotational Motion", "Homework: Gravitation", "Practice Set: SHM & Waves"]),
        description: "Solve all problems with step-by-step reasoning.",
        teacherId: teacher.id, batchId: batchIds[bi],
        type: pick(["HOMEWORK", "PRACTICE", "PROJECT"]),
        totalMarks: 20, passingMarks: 10,
        issuedDate: new Date("2026-04-01"), dueDate: new Date("2026-04-15"),
        status: "PUBLISHED", isPublished: true, lateSubmission: true, latePenalty: 10,
      },
    });

    // Submissions
    for (const ep of enrollmentPairs.filter(ep => ep.batchId === batchIds[bi]).slice(0, 4)) {
      const marks = Math.floor(Math.random() * 20) + 1;
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: assignment.id, studentId: ep.studentId,
          submittedAt: randomDate(new Date("2026-04-02"), new Date("2026-04-14")),
          content: "Please find my solutions attached.",
          status: "GRADED", isLate: Math.random() > 0.8,
          obtainedMarks: marks,
          feedback: marks >= 15 ? "Excellent work!" : marks >= 10 ? "Good effort, keep practicing." : "Needs improvement. Please review the concepts again.",
          gradedBy: teacher.id, gradedAt: new Date(),
        },
      });
    }
  }

  // =========================================================
  // BATCH MATERIALS
  // =========================================================
  const materialData = [
    { batchIdx: 0, title: "Kinematics Formula Sheet", type: "FORMULA_SHEET" as const },
    { batchIdx: 0, title: "Newton's Laws - Lecture Slides", type: "NOTE" as const },
    { batchIdx: 1, title: "Work-Energy Theorem Problems", type: "PRACTICE_SET" as const },
    { batchIdx: 2, title: "NEET Previous Year Questions", type: "REFERENCE" as const },
    { batchIdx: 3, title: "Basic Physics Handout", type: "NOTE" as const },
    { batchIdx: 4, title: "Vector Calculus for Physics", type: "REFERENCE" as const },
    { batchIdx: 5, title: "Optics Video Lecture", type: "VIDEO" as const },
    { batchIdx: 6, title: "Lab Manual - Experiments", type: "REFERENCE" as const },
  ];

  for (const m of materialData) {
    await prisma.batchMaterial.create({
      data: {
        batchId: batchIds[m.batchIdx], title: m.title, type: m.type,
        description: `${m.title} for batch students.`,
        fileUrl: `https://gravityphysics.example.com/materials/${m.title.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        fileSize: Math.floor(Math.random() * 5000000) + 100000,
        isFree: m.batchIdx === 3,
        uploadedBy: teacher.id, views: Math.floor(Math.random() * 100),
        downloads: Math.floor(Math.random() * 30),
      },
    });
  }

  // =========================================================
  // BATCH REVIEWS
  // =========================================================
  const reviewComments = [
    "Excellent teaching methodology! Concepts are very clear.",
    "The course structure is well-organized and easy to follow.",
    "Dr. Sharma explains complex topics in a very simple way.",
    "Great batch for JEE preparation. Highly recommended!",
    "The practice problems and mock tests are very helpful.",
    "I improved my Physics score significantly after joining.",
    "Could have more doubt-clearing sessions.",
    "The study materials provided are top-notch.",
    "Best online Physics coaching I've ever taken.",
    "Interactive sessions make learning enjoyable.",
  ];

  for (let bi = 0; bi < Math.min(4, batchIds.length); bi++) {
    for (let si = 0; si < 3; si++) {
      const stdIdx = Math.floor(Math.random() * studentIds.length);
      try {
        await prisma.batchReview.create({
          data: {
            batchId: batchIds[bi], studentId: studentData[stdIdx].sid,
            rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
            comment: pick(reviewComments),
            pros: ["Clear explanations", "Great study material"],
            cons: Math.random() > 0.7 ? ["Could be more interactive"] : [],
            isVerified: Math.random() > 0.3,
          },
        });
      } catch {
        // Skip duplicate
      }
    }
  }

  // =========================================================
  // NOTES
  // =========================================================
  const noteData = [
    { title: "Kinematics Complete Notes", slug: "kinematics-complete-notes", subject: "Physics", topic: "Kinematics", diff: "INTERMEDIATE" as const, batchIdx: 0 },
    { title: "Laws of Motion - Short Notes", slug: "laws-of-motion-short-notes", subject: "Physics", topic: "Dynamics", diff: "BEGINNER" as const, batchIdx: 0 },
    { title: "Thermodynamics Cheat Sheet", slug: "thermodynamics-cheat-sheet", subject: "Physics", topic: "Thermodynamics", diff: "INTERMEDIATE" as const, batchIdx: 2 },
    { title: "Electrostatics Formula Sheet", slug: "electrostatics-formula", subject: "Physics", topic: "Electrostatics", diff: "ADVANCED" as const, batchIdx: 5 },
    { title: "Modern Physics Quick Revision", slug: "modern-physics-revision-notes", subject: "Physics", topic: "Modern Physics", diff: "ADVANCED" as const, batchIdx: 5 },
  ];

  for (const n of noteData) {
    await prisma.note.upsert({
      where: { slug: n.slug },
      update: {},
      create: {
        title: n.title, slug: n.slug, description: `Comprehensive ${n.title.toLowerCase()} for JEE/NEET preparation.`,
        content: `${n.title}\n\nKey concepts and formulas for ${n.topic}.\n\n1. Definition\n2. Important Formulas\n3. Solved Examples\n4. Practice Problems`,
        subject: n.subject, topic: n.topic, topics: [n.topic],
        teacherId: teacher.id, batchId: batchIds[n.batchIdx],
        isPublic: true, difficulty: n.diff,
        tags: ["Physics", n.topic, "JEE", "NEET"],
        downloads: Math.floor(Math.random() * 200) + 10,
        views: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 50) + 5,
      },
    });
  }

  // =========================================================
  // NOTIFICATIONS
  // =========================================================
  for (const s of studentData.slice(0, 6)) {
    const user = await prisma.user.findUnique({ where: { id: s.id } });
    if (!user) continue;
    for (let i = 0; i < 3; i++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: pick(["CLASS_REMINDER", "EXAM_UPDATE", "PAYMENT_REMINDER", "RESULT_ANNOUNCEMENT", "BATCH_UPDATE", "GENERAL_ANNOUNCEMENT"]),
          channel: "INAPP",
          title: pick(["Upcoming Class Tomorrow", "New Quiz Published", "Fee Payment Due", "Results Released", "Schedule Updated", "New Study Material Added"]),
          message: pick(["Your next class is scheduled at 6 AM.", "A new quiz is now available in your batch.", "Your fee payment is due in 3 days.", "Check out your latest exam results!", "The batch schedule has been updated.", "New study material has been uploaded."]),
          isRead: Math.random() > 0.5,
          createdAt: randomDate(new Date("2026-04-01"), new Date()),
        },
      });
    }
  }

  // =========================================================
  // STUDENT PROGRESS
  // =========================================================
  for (const ep of enrollmentPairs.slice(0, 10)) {
    await prisma.studentProgress.upsert({
      where: { studentId_batchId: { studentId: ep.studentId, batchId: ep.batchId } },
      update: {},
      create: {
        studentId: ep.studentId, batchId: ep.batchId,
        avgQuizScore: Math.floor(Math.random() * 50) + 30,
        avgExamScore: Math.floor(Math.random() * 50) + 30,
        attendance: Math.floor(Math.random() * 30) + 60,
        assignmentsCompleted: Math.floor(Math.random() * 8) + 2,
        totalAssignments: 10,
        improvementRate: Math.floor(Math.random() * 80) + 10,
        strongTopics: pick([["Kinematics"], ["Optics"], ["Thermodynamics"], ["Electrostatics"]]),
        lastActive: randomDate(new Date("2026-04-01"), new Date()),
        totalStudyTime: Math.floor(Math.random() * 5000) + 500,
        loginCount: Math.floor(Math.random() * 50) + 5,
        resourceViews: Math.floor(Math.random() * 200) + 10,
        doubtCount: Math.floor(Math.random() * 15),
      },
    });
  }

  // =========================================================
  // NOTIFICATION PREFERENCES
  // =========================================================
  const allUserIds = [
    teacherUser.id, modUser.id,
    ...studentData.map(s => s.id),
    ...guardianData.map(g => g.id),
  ];
  for (const uid of allUserIds) {
    await prisma.notificationPreference.upsert({
      where: { userId: uid },
      update: {},
      create: {
        userId: uid,
        emailEnabled: true, smsEnabled: true, whatsappEnabled: false,
        inappEnabled: true, pushEnabled: true,
        preferences: { PAYMENT_REMINDER: true, EXAM_UPDATE: true, CLASS_REMINDER: true, RESULT_ANNOUNCEMENT: true },
      },
    });
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📊 Database populated with:");
  console.log(`   👤 Users: ${1 + 1 + studentData.length + guardianData.length} total`);
  console.log(`   📚 Courses: ${courseData.length}`);
  console.log(`   📦 Batches: ${batchData.length}`);
  console.log(`   📝 Enrollments: ${enrollmentPairs.length}`);
  console.log(`   ❓ Quizzes: ${quizData.length}`);
  console.log(`   📋 Exams: ${examData.length}`);
  console.log(`   📰 Posts: ${postContent.length}`);
  console.log(`   ❔ Doubts: ${doubtData.length}`);
  console.log(`   📹 Live Sessions: 6`);
  console.log(`   📄 Assignments: 6`);
  console.log(`   📑 Notes: ${noteData.length}`);
  console.log(`   ⭐ Reviews: 12`);
  console.log("\n🔑 All accounts use password: Test@1234");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
