import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function pad(n: number, w = 3): string {
  return String(n).padStart(w, "0");
}

// ---------------------------------------------------------------------------
// Large data pools
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "Aarav","Vihaan","Vivaan","Ananya","Diya","Advik","Kabir","Reyansh","Ayaan","Aaradhya",
  "Sai","Ishaan","Krishna","Vedant","Rudra","Myra","Anaya","Ishita","Sara","Shanaya",
  "Arjun","Rahul","Priya","Neha","Akash","Sneha","Rohan","Divya","Karan","Ishita",
  "Amit","Sunita","Ravi","Anita","Vikram","Pooja","Manish","Shweta","Deepak","Kavita",
  "Rajesh","Nisha","Sandeep","Meera","Vijay","Geeta","Sanjay","Rekha","Alok","Swati",
  "Prakash","Usha","Manoj","Sarita"," Rakesh","Asha","Dinesh","Lata","Suresh","Radha",
  "Nitin","Madhu","Ashish","Bhavna","Gaurav","Pallavi","Harsh","Deepika","Yash","Komal",
  "Tanmay","Ritu","Kunal","Poonam","Abhishek","Anjali","Siddharth","Kajal","Lokesh","Charu",
  "Rahul","Nidhi","Akshay","Preeti","Pushpendra","Garima","Dheeraj","Babita","Rishabh","Tanya",
  "Puneet","Shikha","Shubham","Rashmi","Aditya","Nikita","Mukesh","Jyoti","Navneet","Anu",
];

const LAST_NAMES = [
  "Sharma","Verma","Patel","Singh","Kumar","Gupta","Joshi","Reddy","Nair","Deshmukh",
  "Mehta","Agarwal","Dubey","Mishra","Pandey","Saxena","Trivedi","Chauhan","Rathore","Solanki",
  "Yadav","Jha","Tiwari","Dwivedi","Bhatt","Shah","Desai","Menon","Iyer","Rao",
  "Naik","Kulkarni","Patil","Mahajan","Sawant","Gawande","Thakur","Prasad","Sinha","Das",
  "Bose","Ghosh","Banerjee","Mukherjee","Chatterjee","Sarkar","Majumdar","Bhowmick","Biswas","Palit",
  "Sethi","Kohli","Bajaj","Kapoor","Malhotra","Chopra","Bhatia","Khanna","Sood","Wadhwa",
];

const CITIES = [
  "Mumbai","Delhi","Bangalore","Hyderabad","Ahmedabad","Chennai","Kolkata","Pune","Jaipur","Lucknow",
  "Nagpur","Indore","Bhopal","Surat","Vadodara","Patna","Ludhiana","Agra","Nashik","Faridabad",
  "Meerut","Rajkot","Varanasi","Srinagar","Aurangabad","Dhanbad","Amritsar","Kanpur","Allahabad","Ranchi",
  "Gwalior","Jabalpur","Coimbatore","Vijayawada","Madurai","Guwahati","Chandigarh","Dehradun","Mysore","Bhubaneswar",
];

const INSTITUTES = [
  "Delhi Public School","St. Xavier's School","Kendriya Vidyalaya","Army Public School","DAV Public School",
  "National Public School","Bishop's School","South Point School","Fiitjee Junior College","Narayana College",
  "Sri Chaitanya College","Allen Career Institute","Resonance Academy","BANSAL Classes","Aakash Institute",
  "DPS RK Puram","Modern School","The Shri Ram School","Vidyamandir Classes","Lakshmipat Singhania Academy",
];

const SUBJECTS = ["Physics","Chemistry","Mathematics","Biology"];
const PHYSICS_TOPICS = [
  "Kinematics","Dynamics","Laws of Motion","Work Energy Power","Rotational Motion","Gravitation",
  "Elasticity","Fluid Mechanics","Thermodynamics","Kinetic Theory","Oscillations","Waves",
  "Electrostatics","Current Electricity","Magnetism","EMI","AC","Optics","Modern Physics",
  "Semiconductors","Communication Systems",
];
const EXAM_TARGETS = ["JEE Main","JEE Advanced","NEET","BITSAT","AIIMS","MHT CET","WBJEE","COMEDK","CUET"];
const BOARDS = ["CBSE","ICSE","Maharashtra State","Karnataka State","Tamil Nadu State","UP Board","Rajasthan Board"];
const GROUPS = ["Science","Commerce","Arts"];
const CLASSES = ["11","12"];
const ED_LEVELS = ["High School","Intermediate","College"];

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding database...");

  // ---- Clean ---------------------------------------------------------------
  console.log("Cleaning existing data...");
  const cleanupOrder = [
    "assignmentSubmission","assignment",
    "liveSessionAttendance","liveSession",
    "attendance","examResult","exam",
    "quizResult","quizAttempt","question","quiz",
    "postShare","postView","postBookmark","commentReaction","postReaction",
    "mediaAttachment","pollVote","poll",
    "comment","post",
    "blogComment","blog",
    "doubtAnswer","doubt",
    "installment","payment","enrollment",
    "batchReview","batchMaterial","batchSession","studentProgress",
    "note","announcement",
    "ticketMessage","supportTicket",
    "certificate","batch","course",
    "notification","notificationPreference",
    "referral","lead","coupon",
    "guardian","student","moderator","teacher",
    "userActivity","deviceToken","auditLog","oTP","session",
    "systemConfig","user",
  ];
  for (const model of cleanupOrder) {
    await (prisma as any)[model].deleteMany();
  }
  console.log("Cleanup done.");

  const password = await hashPassword("Test@1234");

  // ===========================================================
  // SCALE CONFIG — tweak these for more/less data
  // ===========================================================
  const SCALE = {
    teachers: 5,
    moderators: 3,
    students: 500,
    guardians: 120,
    courses: 15,
    batches: 30,
    quizzesPerBatch: 4,
    questionsPerQuiz: 10,
    examsPerBatch: 3,
    posts: 40,
    blogs: 8,
    announcementsPerBatch: 3,
    doubts: 80,
    liveSessions: 40,
    assignmentsPerBatch: 4,
    materialsPerBatch: 4,
    notes: 25,
    tickets: 25,
    coupons: 10,
    leads: 50,
  };

  // ===========================================================
  // TEACHERS
  // ===========================================================
  console.log("Creating teachers...");
  const teachers: { id: string; userId: string; name: string }[] = [];

  for (let i = 1; i <= SCALE.teachers; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const name = `${fn} ${ln}`;
    const email = `teacher${i}@gravityphysics.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: `usr_tch_${pad(i)}`,
        email,
        password,
        phone: `+91987654${pad(3000 + i)}`,
        role: "TEACHER",
        name,
        bio: `${name} — passionate Physics educator with expertise in ${pick(PHYSICS_TOPICS)} and ${pick(PHYSICS_TOPICS)}.`,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=teacher${i}`,
        city: pick(CITIES),
        state: "India",
        isActive: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        lastLogin: randomDate(new Date("2026-05-01"), new Date()),
      },
    });

    const t = await prisma.teacher.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: `tch_${pad(i)}`,
        userId: user.id,
        name,
        bio: `Experienced Physics faculty. Specializes in JEE & NEET preparation.`,
        qualification: pick(["Ph.D. IIT Delhi","M.Sc. Physics IIT Bombay","Ph.D. IISc Bangalore","M.Sc. BHU","Ph.D. TIFR"]),
        expertise: pickN(PHYSICS_TOPICS, 4 + (i % 3)),
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=teacher${i}`,
        achievements: [`Best Teacher Award 202${i % 6}`, `Published ${i + 2} Research Papers`],
        experience: 5 + i * 2,
        designation: pick(["Senior Physics Faculty","Academic Head","HOD Physics","Visiting Professor"]),
        institute: "Gravity Physics Academy",
        gstNumber: `07ABCDE${pad(1000 + i)}F1Z5`,
        upiId: `${fn.toLowerCase()}.${ln.toLowerCase()}@upi`,
        website: `https://gravityphysics.example.com`,
        linkedin: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
        youtube: `https://youtube.com/@gravityphysics`,
        totalStudents: 50 + i * 80,
        averageRating: 4.0 + Math.random(),
        totalCourses: 2 + (i % 4),
        totalBatches: 3 + (i % 5),
        totalReviews: 20 + i * 15,
        settings: { theme: i % 2 ? "dark" : "light", language: "en", timezone: "Asia/Kolkata" },
        officeHours: {
          monday: "10:00-12:00", wednesday: "14:00-16:00", friday: "10:00-12:00",
        },
      },
    });
    teachers.push(t);
  }

  const mainTeacher = teachers[0];

  // ===========================================================
  // MODERATORS
  // ===========================================================
  console.log("Creating moderators...");
  const moderators: { id: string; name: string }[] = [];

  for (let i = 1; i <= SCALE.moderators; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const name = `${fn} ${ln}`;
    const email = `moderator${i}@gravityphysics.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: `usr_mod_${pad(i)}`,
        email,
        password,
        phone: `+91987654${pad(3100 + i)}`,
        role: "MODERATOR",
        name,
        bio: `Content Moderator & Teaching Assistant.`,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        city: pick(CITIES),
        state: "India",
      },
    });

    const mod = await prisma.moderator.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: `mod_${pad(i)}`,
        userId: user.id,
        name,
        assignedBy: mainTeacher.id,
        permissions: {
          canManageBatches: true, canManageAttendance: true,
          canManageDoubts: true, canManagePosts: true, canManageNotes: true,
        },
        lastActive: randomDate(new Date("2026-05-20"), new Date()),
        actionsTaken: 100 + i * 50,
        resolvedIssues: 80 + i * 40,
      },
    });
    moderators.push(mod);
  }

  // ===========================================================
  // STUDENTS (500)
  // ===========================================================
  console.log(`Creating ${SCALE.students} students...`);

  const studentData: { id: string; sid: string; name: string; email: string; phone: string; city: string }[] = [];

  for (let i = 1; i <= SCALE.students; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const name = `${fn} ${ln}`;
    const email = `student${i}@gravityphysics.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: `usr_std_${pad(i, 4)}`,
        email,
        password,
        phone: `+91987655${pad(1000 + i, 4)}`,
        role: "STUDENT",
        name,
        isActive: true,
        isVerified: true,
        emailVerified: true,
        city: pick(CITIES),
        state: "India",
      },
    });

    const sid = `std_${pad(i, 4)}`;
    const st = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: sid,
        userId: user.id,
        name,
        institute: pick(INSTITUTES),
        educationLevel: pick(ED_LEVELS),
        class: pick(CLASSES),
        board: pick(BOARDS),
        examTargets: pickN(EXAM_TARGETS, 1 + (i % 3)),
        group: pick(GROUPS),
        city: pick(CITIES),
        learningGoals: ["Master Physics","Improve Problem Solving","Crack Competitive Exams"],
        preferredSubjects: pickN(SUBJECTS, 2),
        averageScore: Math.floor(Math.random() * 35) + 55,
        attendanceRate: Math.floor(Math.random() * 35) + 55,
        totalCourses: 1 + (i % 3),
      },
    });
    studentData.push({ id: user.id, sid, name, email, phone: user.phone!, city: user.city! });
  }

  // ===========================================================
  // GUARDIANS (~120)
  // ===========================================================
  console.log(`Creating ${SCALE.guardians} guardians...`);

  for (let i = 1; i <= SCALE.guardians; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const name = `Mr./Mrs. ${ln}`;
    const email = `guardian${i}@gravityphysics.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: `usr_grd_${pad(i, 4)}`,
        email,
        password,
        phone: `+91987656${pad(1000 + i, 4)}`,
        role: "GUARDIAN",
        name,
        isActive: true,
        isVerified: true,
        city: pick(CITIES),
        state: "India",
      },
    });

    const grd = await prisma.guardian.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        id: `grd_${pad(i, 4)}`,
        userId: user.id,
        name,
        relationship: pick(["Father","Mother","Guardian","Elder Sibling"]),
        occupation: pick(["Engineer","Doctor","Teacher","Business","Civil Servant","Lawyer","CA"]),
        income: 500000 + Math.floor(Math.random() * 2500000),
      },
    });

    // Attach guardian to a random student (not already having one)
    const studentWithoutGuardian = studentData.find(
      s => !studentData.some((_, idx) => {
        // simple round-robin: first i students get guardians
        return idx < i && idx === i - 1; // just assign to student[i-1] if within range
      })
    );
    if (i <= studentData.length) {
      const studentIdx = i - 1;
      try {
        await prisma.student.update({
          where: { id: studentData[studentIdx].sid },
          data: { guardianId: grd.id },
        });
      } catch { /* already has guardian */ }
    }
  }

  // ===========================================================
  // COURSES (15)
  // ===========================================================
  console.log(`Creating ${SCALE.courses} courses...`);

  const courseNames = [
    "Complete Physics for JEE Advanced","NEET Physics Crash Course","Physics Fundamentals",
    "Mathematics for Physics","Experimental Physics & Viva","Electrodynamics Mastery",
    "Thermodynamics & Statistical Mechanics","Quantum Mechanics Essentials","Optics & Wave Physics",
    "Mechanics & Kinematics Deep Dive","Modern Physics for Competitions","Fluid Mechanics & Elasticity",
    "Electromagnetism for JEE","Nuclear & Particle Physics","Astrophysics Basics",
  ];
  const courseSlugs = courseNames.map(n => n.toLowerCase().replace(/\s+/g, "-"));

  const courseIds: string[] = [];
  for (let i = 0; i < SCALE.courses; i++) {
    const cid = `crs_${pad(i + 1)}`;
    const teacher = teachers[i % teachers.length];
    const price = i < 2 ? 0 : 5000 + Math.floor(Math.random() * 25000);
    const level = i < 3 ? "BEGINNER" : i < 8 ? "INTERMEDIATE" : "ADVANCED";
    courseIds.push(cid);

    await prisma.course.upsert({
      where: { slug: courseSlugs[i] },
      update: {},
      create: {
        id: cid,
        title: courseNames[i],
        slug: courseSlugs[i],
        description: `Comprehensive course on ${courseNames[i]}. Covers all topics from basics to advanced level.`,
        subject: i < 4 ? "Physics" : pick(SUBJECTS),
        category: "Science",
        teacherId: teacher.id,
        thumbnail: `https://picsum.photos/seed/course${i}/400/225`,
        price,
        isFree: price === 0,
        level: level as any,
        duration: 20 + Math.floor(Math.random() * 180),
        learningOutcomes: [
          `Master all ${courseNames[i]} topics`,
          "Solve advanced problems",
          "Develop strong intuition",
        ],
        metaKeywords: ["physics", "jee", "neet", "study"],
        prerequisites: ["Class 11 Physics", "Basic Mathematics"],
        metaTitle: courseNames[i],
        metaDescription: `Learn ${courseNames[i]} online with India's best faculty.`,
      },
    });
  }

  // ===========================================================
  // BATCHES (30)
  // ===========================================================
  console.log(`Creating ${SCALE.batches} batches...`);

  const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday"];
  const sessionNames = ["Morning","Evening","Afternoon","Night"];

  const batchData: { id: string; courseId: string; price: number; teacherId: string; slug: string }[] = [];

  for (let i = 0; i < SCALE.batches; i++) {
    const bid = `bch_${pad(i + 1)}`;
    const courseIdx = i % courseIds.length;
    const teacher = teachers[i % teachers.length];
    const price = 5000 + Math.floor(Math.random() * 25000);
    const mode = pick(["ONLINE","ONLINE","ONLINE","OFFLINE","HYBRID"] as const);
    const sn = sessionNames[i % sessionNames.length];
    const startDays = pickN(DAYS, 2 + (i % 3));
    const slug = `${courseSlugs[courseIdx]}-batch-${i + 1}`;

    batchData.push({ id: bid, courseId: courseIds[courseIdx], price, teacherId: teacher.id, slug });

    await prisma.batch.upsert({
      where: { slug },
      update: {},
      create: {
        id: bid,
        name: `${courseNames[courseIdx]} — ${sn} Batch`,
        slug,
        courseId: courseIds[courseIdx],
        teacherId: teacher.id,
        subject: "Physics",
        mode,
        language: "English",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-12-31"),
        price,
        maxStudents: 40 + Math.floor(Math.random() * 60),
        currentEnrollments: 0,
        minimumStudents: 10,
        enrollmentOpen: true,
        isPublished: true,
        isActive: true,
        visibility: "PUBLIC",
        topics: pickN(PHYSICS_TOPICS, 4),
        prerequisites: ["Basic Physics Knowledge", "Class 11 Mathematics"],
        resources: { textbooks: ["HC Verma", "DC Pandey"] },
        liveClassLink: mode === "ONLINE" ? `https://zoom.us/j/gravity${pad(i + 1)}` : null,
        liveClassPlatform: "Zoom",
        meetingId: String(9876000000 + i),
        meetingPassword: "Gravity123",
        totalClasses: 120,
        completedClasses: Math.floor(Math.random() * 40),
        averageRating: 3.5 + Math.random() * 1.5,
        totalReviews: Math.floor(Math.random() * 30) + 5,
      },
    });

    // create 1-2 batch sessions
    const sessionCount = 1 + (i % 2);
    for (let s = 0; s < sessionCount; s++) {
      const sName = pick(sessionNames);
      const sDays = pickN(DAYS, 2 + (s % 3));
      await prisma.batchSession.create({
        data: {
          batchId: bid,
          name: sName,
          days: sDays,
          startTime: `${6 + s * 4}:00`,
          endTime: `${8 + s * 4}:00`,
        },
      });
    }
  }

  // ===========================================================
  // ENROLLMENTS (2000+)
  // ===========================================================
  console.log("Creating enrollments (2000+)...");

  const enrollmentPairs: { studentId: string; batchId: string; enrollmentId: string }[] = [];
  const statuses = ["APPROVED","APPROVED","APPROVED","COMPLETED","PENDING","WAITLISTED"] as const;

  // Each student enrolls in 3-6 batches
  for (let si = 0; si < studentData.length; si++) {
    const batchCount = 3 + (si % 4);
    const enrolledBatches = new Set<string>();

    for (let b = 0; b < batchCount; b++) {
      const bi = (si * 7 + b * 13) % batchData.length;
      const batch = batchData[bi];
      if (enrolledBatches.has(batch.id)) continue;
      enrolledBatches.add(batch.id);

      const enrolledAt = randomDate(new Date("2026-03-01"), new Date("2026-05-15"));
      const status = pick(statuses);

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: studentData[si].sid,
          batchId: batch.id,
          status,
          totalFees: batch.price,
          paidAmount: status === "COMPLETED" ? batch.price : status === "PENDING" ? 0 : batch.price,
          dueAmount: status === "COMPLETED" ? 0 : batch.price,
          appliedAt: enrolledAt,
          approvedAt: status !== "PENDING" ? new Date(enrolledAt.getTime() + 86400000) : null,
          progressPercentage: Math.floor(Math.random() * 80) + 10,
          classesAttended: Math.floor(Math.random() * 40),
          totalClasses: 60,
          assignmentsDone: Math.floor(Math.random() * 10),
          averageScore: Math.random() * 100,
          scholarshipAmount: 0,
        },
      });
      enrollmentPairs.push({ studentId: studentData[si].sid, batchId: batch.id, enrollmentId: enrollment.id });

      // Payment for non-PENDING
      if (status !== "PENDING" && batch.price > 0) {
        const payment = await prisma.payment.create({
          data: {
            enrollmentId: enrollment.id,
            studentId: studentData[si].sid,
            amount: batch.price,
            paidAmount: batch.price,
            dueAmount: 0,
            tax: Math.round(batch.price * 0.18),
            totalAmount: Math.round(batch.price * 1.18),
            method: pick(["ONLINE","CARD","UPI","NET_BANKING"]),
            status: "COMPLETED",
            transactionId: `TXN${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
            paymentGateway: pick(["Razorpay","Stripe","SSLCommerz"]),
            paymentDate: randomDate(new Date("2026-03-01"), new Date()),
            invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            cardLast4: String(1000 + Math.floor(Math.random() * 9000)),
            cardBrand: pick(["Visa","Mastercard","RuPay"]),
          },
        });

        // Installments for high-value
        if (batch.price > 10000) {
          const installmentAmount = Math.round(batch.price / 3);
          for (let inst = 0; inst < 3; inst++) {
            const due = new Date("2026-04-01");
            due.setMonth(due.getMonth() + inst);
            const isPaid = inst === 0;
            await prisma.installment.create({
              data: {
                enrollmentId: enrollment.id,
                amount: installmentAmount,
                dueDate: due,
                paidDate: isPaid ? new Date(due.getTime() - 86400000) : null,
                status: isPaid ? "COMPLETED" : "PENDING",
                paymentId: isPaid ? payment.id : null,
              },
            });
          }
        }
      }
    }
  }

  console.log(`  → ${enrollmentPairs.length} enrollments created`);

  // ===========================================================
  // CERTIFICATES (for completed)
  // ===========================================================
  const completedEnrollments = await prisma.enrollment.findMany({ where: { status: "COMPLETED" }, take: 100 });
  for (const ce of completedEnrollments) {
    const certNum = `CERT-${ce.studentId}-${ce.batchId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await prisma.certificate.create({
        data: {
          certificateNumber: certNum,
          type: "COURSE_COMPLETION",
          title: "Course Completion Certificate",
          description: "Successfully completed the batch requirements",
          studentId: ce.studentId,
          teacherId: pick(teachers).id,
          batchId: ce.batchId,
          issueDate: new Date(),
          grade: pick(["A+","A","B+","B"]),
          score: Math.floor(Math.random() * 20) + 75,
          pdfUrl: `https://gravityphysics.example.com/certificates/${certNum}.pdf`,
          shareableLink: `https://gravityphysics.example.com/verify/${certNum}`,
          viewCount: Math.floor(Math.random() * 5),
        },
      });
    } catch { /* unique constraint */ }
  }

  // ===========================================================
  // QUIZZES & QUESTIONS
  // ===========================================================
  console.log("Creating quizzes & questions...");

  const mcqPool = [
    { q: "What is the SI unit of force?", opts: ["Newton","Joule","Watt","Pascal"], ans: 0 },
    { q: "Acceleration due to gravity at Earth's surface?", opts: ["9.8 m/s²","8.9 m/s²","10.2 m/s²","9.0 m/s²"], ans: 0 },
    { q: "Which law: energy cannot be created or destroyed?", opts: ["Newton's First","Conservation of Energy","Ohm's Law","Boyle's Law"], ans: 1 },
    { q: "Speed of light in vacuum?", opts: ["3×10⁶ m/s","3×10⁸ m/s","3×10¹⁰ m/s","3×10⁵ m/s"], ans: 1 },
    { q: "Unit of electric current?", opts: ["Volt","Ampere","Ohm","Coulomb"], ans: 1 },
    { q: "Which is a scalar quantity?", opts: ["Velocity","Force","Energy","Acceleration"], ans: 2 },
    { q: "Boiling point of water in Celsius?", opts: ["90°C","100°C","110°C","120°C"], ans: 1 },
    { q: "Resistance depends on?", opts: ["Length","Area","Material","Length, area, material"], ans: 3 },
    { q: "Which particle has no charge?", opts: ["Proton","Electron","Neutron","Ion"], ans: 2 },
    { q: "AC frequency in India?", opts: ["40 Hz","50 Hz","60 Hz","100 Hz"], ans: 1 },
    { q: "Focal length of convex lens?", opts: ["Always positive","Always negative","Zero","Infinite"], ans: 0 },
    { q: "NOT a nuclear reaction?", opts: ["Fission","Fusion","Diffraction","Radioactive decay"], ans: 2 },
    { q: "Escape velocity from Earth?", opts: ["7 km/s","9.8 km/s","11.2 km/s","15 km/s"], ans: 2 },
    { q: "Principle of transformer?", opts: ["EM induction","Electrolysis","Thermionic emission","Photoelectric effect"], ans: 0 },
    { q: "Angle between E-field and equipotential surface?", opts: ["0°","45°","90°","180°"], ans: 2 },
    { q: "Device that converts AC to DC?", opts: ["Transformer","Rectifier","Amplifier","Oscillator"], ans: 1 },
    { q: "Light bending around obstacles called?", opts: ["Refraction","Diffraction","Reflection","Dispersion"], ans: 1 },
    { q: "Atomic number of Carbon?", opts: ["4","6","8","12"], ans: 1 },
    { q: "SI unit of capacitance?", opts: ["Farad","Henry","Tesla","Weber"], ans: 0 },
    { q: "Color with longest wavelength?", opts: ["Violet","Blue","Green","Red"], ans: 3 },
    { q: "Rate of change of velocity?", opts: ["Speed","Acceleration","Momentum","Force"], ans: 1 },
    { q: "Absolute zero in Celsius?", opts: ["-100°C","-200°C","-273.15°C","-300°C"], ans: 2 },
    { q: "Law of inertia?", opts: ["Newton's First","Newton's Second","Newton's Third","Law of Gravitation"], ans: 0 },
    { q: "Unit of magnetic field?", opts: ["Tesla","Gauss","Weber","Henry"], ans: 0 },
    { q: "Photoelectric effect explained by?", opts: ["Newton","Einstein","Planck","Bohr"], ans: 1 },
    { q: "Work done in isothermal process?", opts: ["Zero","PV ln(V₂/V₁)","nRT ln(V₂/V₁)","PΔV"], ans: 2 },
    { q: "Which has highest specific heat?", opts: ["Oxygen","Hydrogen","Nitrogen","Helium"], ans: 1 },
    { q: "Dimensional formula of Planck's constant?", opts: ["[ML²T⁻¹]","[ML²T⁻²]","[ML²T⁻³]","[ML¹T⁻¹]"], ans: 0 },
    { q: "For a convex mirror, image is always?", opts: ["Real","Virtual","Inverted","Magnified"], ans: 1 },
    { q: "Wien's displacement law relates?", opts: ["λT = constant","λ/T = constant","λ²T = constant","λT² = constant"], ans: 0 },
    { q: "Superconductivity discovered by?", opts: ["Faraday","Onnes","Curie","Rutherford"], ans: 1 },
    { q: "Compton effect proves?", opts: ["Wave nature","Particle nature","Both","Neither"], ans: 1 },
    { q: "Hall effect gives?", opts: ["Electric field","Magnetic field","Carrier concentration","Resistance"], ans: 2 },
    { q: "Beta decay involves emission of?", opts: ["Electron","Proton","Neutron","Alpha particle"], ans: 0 },
    { q: "Lasers operate on principle of?", opts: ["Stimulated emission","Spontaneous emission","Blackbody radiation","Photoelectric effect"], ans: 0 },
    { q: "Which is not a magnetic material?", opts: ["Iron","Nickel","Cobalt","Copper"], ans: 3 },
    { q: "Piezoelectric effect produces?", opts: ["Current","Voltage","Resistance","Capacitance"], ans: 1 },
    { q: "Unit of radioactivity?", opts: ["Curie","Rutherford","Becquerel","All of these"], ans: 3 },
    { q: "Rainbow formation due to?", opts: ["Refraction only","Reflection only","Dispersion & Reflection","Diffraction"], ans: 2 },
    { q: "Doppler effect in light causes?", opts: ["Redshift","Blueshift","Both","Neither"], ans: 2 },
    { q: "Critical angle depends on?", opts: ["RI of denser medium","RI of rarer medium","Both","Wavelength"], ans: 2 },
    { q: "Mutual inductance unit?", opts: ["Henry","Farad","Tesla","Weber"], ans: 0 },
    { q: "Modulation is used in?", opts: ["Communication","Power generation","Lighting","Heating"], ans: 0 },
    { q: "Which has the highest frequency?", opts: ["Radio waves","Microwaves","Gamma rays","UV rays"], ans: 2 },
    { q: "Ohm's law valid for?", opts: ["All conductors","Semiconductors","Metals only","Electrolytes"], ans: 2 },
    { q: "Charge on electron?", opts: ["1.6×10⁻¹⁹ C","1.6×10⁻¹⁷ C","1.6×10⁻¹⁸ C","1.6×10⁻²⁰ C"], ans: 0 },
    { q: "Mass-energy equivalence given by?", opts: ["Einstein","Newton","Bohr","Heisenberg"], ans: 0 },
    { q: "Which force is the strongest?", opts: ["Gravitational","Electromagnetic","Strong nuclear","Weak nuclear"], ans: 2 },
    { q: "Brewster's angle relates to?", opts: ["Reflection","Refraction","Polarization","Diffraction"], ans: 2 },
    { q: "Kirchhoff's current law based on?", opts: ["Energy conservation","Charge conservation","Momentum","Mass"], ans: 1 },
  ];

  const quizTitles = [
    "Kinematics Basics","Newton's Laws","Electrostatics","Thermodynamics","Optics Mock",
    "Modern Physics","Current Electricity","Magnetism","SHM & Waves","Gravitation",
    "Rotational Motion","Fluid Mechanics","Elasticity","AC Circuits","EMI",
  ];

  for (let qi = 0; qi < Math.min(quizTitles.length, 30); qi++) {
    const batch = batchData[qi % batchData.length];
    const marks = 20 + Math.floor(Math.random() * 40);
    const pass = Math.floor(marks * 0.4);
    const diff = pick(["BEGINNER","INTERMEDIATE","ADVANCED"] as const);

    const quiz = await prisma.quiz.create({
      data: {
        id: `qz_${pad(qi + 1)}`,
        title: quizTitles[qi],
        slug: `${quizTitles[qi].toLowerCase().replace(/\s+/g, "-")}-${qi}`,
        description: `${diff} level quiz on ${quizTitles[qi]}`,
        teacherId: pick(teachers).id,
        batchId: batch.id,
        timeLimit: 30 + Math.floor(Math.random() * 30),
        totalMarks: marks,
        passingMarks: pass,
        status: "PUBLISHED",
        isActive: true,
        difficulty: diff,
        subject: "Physics",
        topics: [pick(PHYSICS_TOPICS)],
        showResult: true,
        showAnswer: true,
        showExplanation: true,
        showLeaderboard: true,
        allowRetake: false,
        maxAttempts: 1,
        startTime: new Date("2026-04-01"),
        endTime: new Date("2026-12-31"),
      },
    });

    // Questions per quiz
    const shuffledQ = [...mcqPool].sort(() => Math.random() - 0.5).slice(0, SCALE.questionsPerQuiz);
    for (let qj = 0; qj < shuffledQ.length; qj++) {
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          text: shuffledQ[qj].q,
          type: "MCQ",
          options: shuffledQ[qj].opts,
          correctAnswer: shuffledQ[qj].ans,
          marks: Math.floor(marks / shuffledQ.length),
          negativeMarks: 0,
          difficulty: diff,
          topic: pick(PHYSICS_TOPICS),
          order: qj + 1,
        },
      });
    }
  }

  // Quiz attempts & results
  const allQuizzes = await prisma.quiz.findMany({ take: 30 });
  for (let si = 0; si < Math.min(200, studentData.length); si++) {
    for (let qi = 0; qi < Math.min(5, allQuizzes.length); qi++) {
      const q = allQuizzes[qi];
      const isEnrolled = enrollmentPairs.some(ep => ep.studentId === studentData[si].sid);
      if (!isEnrolled) continue;

      const score = Math.floor(Math.random() * q.totalMarks);
      const pct = (score / q.totalMarks) * 100;

      try {
        const attempt = await prisma.quizAttempt.create({
          data: {
            quizId: q.id,
            studentId: studentData[si].sid,
            attemptNumber: 1,
            startTime: new Date("2026-04-10"),
            endTime: new Date("2026-04-10"),
            score,
            percentage: pct,
            isPassed: score >= (q.passingMarks || 0),
            isCompleted: true,
            timeSpent: Math.floor(Math.random() * q.timeLimit! * 60),
          },
        });

        await prisma.quizResult.create({
          data: {
            attemptId: attempt.id,
            studentId: studentData[si].sid,
            quizId: q.id,
            totalMarks: q.totalMarks,
            obtainedMarks: score,
            percentage: pct,
            rank: Math.floor(Math.random() * 100) + 1,
            totalParticipants: 50 + Math.floor(Math.random() * 100),
            weakTopics: [pick(PHYSICS_TOPICS)],
            strongTopics: [pick(PHYSICS_TOPICS)],
            timeAnalysis: { avg: q.timeLimit },
          },
        });
      } catch { /* unique constraint */ }
    }
  }

  // ===========================================================
  // EXAMS & RESULTS
  // ===========================================================
  console.log("Creating exams & results...");

  const examTypes = ["Weekly","Monthly","Mock","Model Test","Final"];
  for (let ei = 0; ei < Math.min(20, SCALE.batches); ei++) {
    const batch = batchData[ei % batchData.length];
    const marks = 80 + Math.floor(Math.random() * 120);
    const dur = 120 + Math.floor(Math.random() * 120);
    const examDate = randomDate(new Date("2026-04-01"), new Date("2026-06-30"));

    await prisma.exam.create({
      data: {
        id: `exm_${pad(ei + 1)}`,
        title: `${pick(examTypes)} Test ${ei + 1}`,
        slug: `exam-${ei + 1}-${Date.now()}`,
        description: `${pick(examTypes)} assessment for batch.`,
        teacherId: pick(teachers).id,
        batchId: batch.id,
        type: pick(examTypes),
        subject: "Physics",
        fullMarks: marks,
        passMarks: Math.floor(marks * 0.35),
        examDate,
        startTime: new Date(examDate.getTime() + 32400000),
        endTime: new Date(examDate.getTime() + 32400000 + dur * 60000),
        duration: dur,
        status: "RESULT_PUBLISHED",
        isResultPublished: true,
        gradingType: "AUTO",
        showRank: true,
        showPercentile: true,
      },
    });

    // Results for enrolled students
    const enrolled = enrollmentPairs.filter(ep => ep.batchId === batch.id).slice(0, 30);
    for (const ep of enrolled) {
      const obtained = Math.floor(Math.random() * marks * 0.85) + marks * 0.1;
      try {
        await prisma.examResult.create({
          data: {
            examId: `exm_${pad(ei + 1)}`,
            studentId: ep.studentId,
            obtainedMarks: obtained,
            totalMarks: marks,
            percentage: (obtained / marks) * 100,
            grade: obtained >= marks * 0.9 ? "A+" : obtained >= marks * 0.75 ? "A" : obtained >= marks * 0.6 ? "B" : "C",
            rank: Math.floor(Math.random() * 50) + 1,
            subjectWiseMarks: { physics: obtained },
            feedback: "Good attempt! Keep practicing.",
          },
        });
      } catch { /* unique constraint */ }
    }
  }

  // ===========================================================
  // ATTENDANCE (batch * students * days)
  // ===========================================================
  console.log("Creating attendance records (10,000+)...");

  let attCount = 0;
  for (let ei = 0; ei < Math.min(30, enrollmentPairs.length); ei++) {
    const ep = enrollmentPairs[ei];
    const days = 15 + (ei % 10);
    for (let d = 0; d < days; d++) {
      const date = new Date("2026-04-01");
      date.setDate(date.getDate() + d * 2);
      try {
        await prisma.attendance.create({
          data: {
            studentId: ep.studentId,
            batchId: ep.batchId,
            date,
            status: pick(["PRESENT","PRESENT","PRESENT","ABSENT","LATE"]),
            checkInTime: new Date(date.getTime() + 36000000),
            checkOutTime: new Date(date.getTime() + 39600000),
            duration: 60,
            markedBy: pick(teachers).id,
            verified: true,
          },
        });
        attCount++;
      } catch { /* unique */ }
    }
  }
  console.log(`  → ${attCount} attendance records`);

  // ===========================================================
  // LIVE SESSIONS
  // ===========================================================
  console.log("Creating live sessions...");

  for (let i = 0; i < SCALE.liveSessions; i++) {
    const batch = batchData[i % batchData.length];
    const sessionDate = new Date("2026-04-05");
    sessionDate.setDate(sessionDate.getDate() + i * 7);

    const session = await prisma.liveSession.create({
      data: {
        id: `ls_${pad(i + 1)}`,
        title: pick(["Kinematics Review","Newton's Laws Deep Dive","WEP","Rotational Motion","Gravitation","SHM","Electrostatics Review","Optics Class","Thermodynamics","Modern Physics"]),
        description: "Interactive live session covering key concepts.",
        teacherId: pick(teachers).id,
        batchId: batch.id,
        startTime: sessionDate,
        endTime: new Date(sessionDate.getTime() + 7200000),
        duration: 120,
        platform: "Zoom",
        meetingUrl: `https://zoom.us/j/gravity${i + 1}`,
        meetingId: `${9876000000 + i}`,
        meetingPassword: `Gravity${i + 1}`,
        isCompleted: i < SCALE.liveSessions * 0.7,
        isLive: i >= Math.floor(SCALE.liveSessions * 0.7),
        isRecorded: i < SCALE.liveSessions * 0.7,
        recordingAvailable: i < SCALE.liveSessions * 0.7,
        recordingUrl: i < SCALE.liveSessions * 0.7 ? `https://gravityphysics.example.com/recordings/session${i + 1}` : null,
      },
    });

    // Attendance for completed sessions
    if (i < SCALE.liveSessions * 0.7) {
      const attendees = enrollmentPairs.filter(ep => ep.batchId === batch.id).slice(0, 5 + (i % 10));
      for (const ep of attendees) {
        try {
          await prisma.liveSessionAttendance.create({
            data: {
              sessionId: session.id,
              studentId: ep.studentId,
              joinedAt: sessionDate,
              leftAt: new Date(sessionDate.getTime() + 7200000),
              duration: 7000,
              isPresent: true,
            },
          });
        } catch { /* unique */ }
      }
    }
  }

  // ===========================================================
  // ASSIGNMENTS
  // ===========================================================
  console.log("Creating assignments...");

  for (let i = 0; i < SCALE.assignmentsPerBatch * Math.min(20, batchData.length); i++) {
    const batch = batchData[i % batchData.length];
    const assignment = await prisma.assignment.create({
      data: {
        id: `asn_${pad(i + 1)}`,
        title: pick(["Problem Set","Numericals","Practice","Assignment","Homework","Practice Set"]),
        description: "Solve all problems with step-by-step reasoning.",
        teacherId: pick(teachers).id,
        batchId: batch.id,
        type: pick(["HOMEWORK","PRACTICE","PROJECT"]),
        totalMarks: 20,
        passingMarks: 10,
        issuedDate: new Date("2026-04-01"),
        dueDate: new Date("2026-04-15"),
        status: "PUBLISHED",
        isPublished: true,
        lateSubmission: true,
        latePenalty: 10,
      },
    });

    // Submissions
    const enrolled = enrollmentPairs.filter(ep => ep.batchId === batch.id).slice(0, 8);
    for (const ep of enrolled) {
      const marks = Math.floor(Math.random() * 20) + 1;
      try {
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: assignment.id,
            studentId: ep.studentId,
            submittedAt: randomDate(new Date("2026-04-02"), new Date("2026-04-14")),
            content: "Please find my solutions attached.",
            status: "GRADED",
            isLate: Math.random() > 0.8,
            obtainedMarks: marks,
            feedback: marks >= 15 ? "Excellent work!" : marks >= 10 ? "Good effort." : "Needs improvement.",
            gradedBy: pick(teachers).id,
            gradedAt: new Date(),
          },
        });
      } catch { /* unique */ }
    }
  }

  // ===========================================================
  // POSTS, COMMENTS, REACTIONS
  // ===========================================================
  console.log("Creating posts & social engagement...");

  const postTopics = [
    "Newton's Laws — Visual Guide","Optics: Ray Diagrams","Thermodynamics Formula Sheet",
    "JEE Advanced 2026 Strategy","Mock Test Analysis","Electrostatics Mind Map",
    "Study Tips from Toppers","Doubt: E=mc² explained","Weekly Quiz Results",
    "Schedule Change Notice","Kinematics Cheat Sheet","Magnetism Made Simple",
    "AC Circuits in 10 Minutes","Semiconductor Basics","Nuclear Physics Overview",
  ];

  for (let i = 0; i < SCALE.posts; i++) {
    const teacher = pick(teachers);
    const post = await prisma.post.create({
      data: {
        id: `post_${pad(i + 1)}`,
        title: postTopics[i % postTopics.length],
        content: `Detailed content about ${postTopics[i % postTopics.length]}. This post covers key concepts and practice problems.`,
        slug: `post-${i + 1}-${Date.now()}`,
        excerpt: `Learn about ${postTopics[i % postTopics.length]}`,
        type: pick(["TEXT","IMAGE","PDF","VIDEO"] as const),
        status: "PUBLISHED",
        visibility: pick(["PUBLIC","PUBLIC","PUBLIC","BATCH_ONLY"] as const),
        teacherId: teacher.id,
        batchId: i % 2 === 0 ? pick(batchData).id : null,
        isFeatured: i < 5,
        tags: ["Physics","Study"],
        topics: [pick(PHYSICS_TOPICS)],
        views: Math.floor(Math.random() * 1000) + 10,
        uniqueViews: Math.floor(Math.random() * 300) + 5,
        shares: Math.floor(Math.random() * 50),
        publishedAt: randomDate(new Date("2026-03-01"), new Date()),
      },
    });

    // Media
    if (i % 3 === 0) {
      await prisma.mediaAttachment.create({
        data: {
          postId: post.id,
          url: `https://picsum.photos/seed/post${i}/800/600`,
          type: "image/jpeg",
          category: "IMAGE",
          filename: `post-${i}.jpg`,
          fileSize: Math.floor(Math.random() * 5000000) + 50000,
          caption: `Image for ${postTopics[i % postTopics.length]}`,
          displayOrder: 0,
        },
      });
    }

    // Comments
    const commentCount = 1 + Math.floor(Math.random() * 5);
    for (let c = 0; c < commentCount; c++) {
      const si = Math.floor(Math.random() * studentData.length);
      try {
        const comment = await prisma.comment.create({
          data: {
            content: pick(["Great explanation!","Very helpful, thanks!","Can you explain more?","This cleared my doubt.","Excellent visualization!","Please share more resources.","Well explained!"]),
            postId: post.id,
            studentId: studentData[si].sid,
            status: "ACTIVE",
            createdAt: randomDate(new Date("2026-03-01"), new Date()),
          },
        });

        // Reactions on comment
        if (Math.random() > 0.5) {
          try {
            await prisma.commentReaction.create({
              data: {
                commentId: comment.id,
                studentId: studentData[Math.floor(Math.random() * studentData.length)].sid,
                type: pick(["LIKE","LOVE","HELPFUL"]),
              },
            });
          } catch { /* unique */ }
        }
      } catch { /* unique */ }
    }

    // Reactions on post
    for (let r = 0; r < 1 + Math.floor(Math.random() * 6); r++) {
      try {
        await prisma.postReaction.create({
          data: {
            postId: post.id,
            studentId: studentData[Math.floor(Math.random() * studentData.length)].sid,
            type: pick(["LIKE","LOVE","HELPFUL","INSIGHTFUL","CELEBRATE"]),
          },
        });
      } catch { /* unique */ }
    }
  }

  // ===========================================================
  // BLOGS
  // ===========================================================
  console.log("Creating blogs...");

  const blogTitles = [
    "How to Master Physics for JEE Advanced","NEET Physics Common Mistakes",
    "The Beauty of Quantum Mechanics","Kinematics: The Foundation of Physics",
    "Thermodynamics for Beginners","Electrostatics Demystified",
    "5 Tips for IIT JEE Preparation","Understanding Wave Optics",
  ];

  for (let i = 0; i < Math.min(blogTitles.length, SCALE.blogs); i++) {
    const blog = await prisma.blog.upsert({
      where: { slug: blogTitles[i].toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        title: blogTitles[i],
        slug: blogTitles[i].toLowerCase().replace(/\s+/g, "-"),
        excerpt: `An insightful article about ${blogTitles[i]}.`,
        content: `# ${blogTitles[i]}\n\nDetailed content about ${blogTitles[i]}. Covers all important concepts for competitive exams.`,
        teacherId: pick(teachers).id,
        featuredImage: `https://picsum.photos/seed/blog${i}/1200/630`,
        thumbnail: `https://picsum.photos/seed/blog${i}/1200/630`,
        views: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 60) + 5,
        shares: Math.floor(Math.random() * 20),
        readTime: 5 + Math.floor(Math.random() * 10),
        isPublished: true,
        publishedAt: randomDate(new Date("2026-03-01"), new Date()),
        categories: [pick(["Exam Strategy","Physics Concepts","Study Tips","Motivation"])],
        tags: ["Physics","JEE","NEET","Study"],
        allowComments: true,
      },
    });

    for (let bc = 0; bc < 3; bc++) {
      await prisma.blogComment.create({
        data: {
          blogId: blog.id,
          name: pick(["Rahul S.","Priya P.","Anonymous","PhysicsFan","NEETAspirant"]),
          email: pick(["user1@email.com","user2@email.com","anon@email.com"]),
          content: pick(["Great article!","Very helpful.","Please write more on this.","Excellent explanation!"]),
          status: "APPROVED",
          isApproved: true,
        },
      });
    }
  }

  // ===========================================================
  // ANNOUNCEMENTS
  // ===========================================================
  console.log("Creating announcements...");

  for (let bi = 0; bi < Math.min(batchData.length, 20); bi++) {
    const count = 1 + (bi % 3);
    for (let a = 0; a < count; a++) {
      await prisma.announcement.create({
        data: {
          title: pick(["Welcome!","Schedule Update","Exam Notice","Fee Reminder","Holiday Notice","Assignment Due"]),
          content: pick(["Important announcement for all batch members.","Please check your updated schedule.","Upcoming exam details shared.","Fee payment due soon.","Holiday on this date."]),
          batchId: batchData[bi].id,
          isPinned: a === 0,
          isUrgent: a === 1,
          createdBy: pick(teachers).id,
          views: Math.floor(Math.random() * 100),
        },
      });
    }
  }

  // ===========================================================
  // DOUBTS & ANSWERS
  // ===========================================================
  console.log("Creating doubts...");

  const doubtQuestions = [
    "Confused about centripetal force","Kirchhoff's loop rule","Photoelectric effect question",
    "Lenz's law application","SHM vs Circular Motion","Young's Double Slit",
    "RC Circuit time constant","Faraday's Law","Magnetic moment","Nuclear binding energy",
    "Bernoulli's principle","Doppler effect","Interference pattern","Atomic spectra",
    "Semiconductor doping","Transformer working","AC generator","Compton effect",
    "Blackbody radiation","Photoelectric threshold",
  ];

  for (let i = 0; i < Math.min(doubtQuestions.length, SCALE.doubts); i++) {
    const si = Math.floor(Math.random() * studentData.length);
    const teacher = pick(teachers);

    try {
      const doubt = await prisma.doubt.create({
        data: {
          id: `dbt_${pad(i + 1)}`,
          title: doubtQuestions[i],
          description: `I need help understanding ${doubtQuestions[i]}. Please explain with examples.`,
          studentId: studentData[si].sid,
          batchId: pick(batchData).id,
          subject: "Physics",
          topic: pick(PHYSICS_TOPICS),
          status: pick(["ANSWERED","RESOLVED"] as const),
          priority: pick(["LOW","MEDIUM","HIGH"]),
          assignedTo: teacher.id,
          tags: ["doubt","physics"],
          viewCount: Math.floor(Math.random() * 50) + 5,
          upvoteCount: Math.floor(Math.random() * 10),
          createdAt: randomDate(new Date("2026-03-01"), new Date()),
        },
      });

      await prisma.doubtAnswer.create({
        data: {
          doubtId: doubt.id,
          teacherId: teacher.id,
          content: pick([
            "Great question! Let me explain step by step. The key concept here is understanding the fundamental principle. First, consider the basic definition...",
            "This is a common doubt among students. The answer lies in applying the correct formula. Let's derive it from first principles...",
            "Excellent question! The key insight is that when you carefully analyze the forces/magnitudes involved, the result becomes clear. Here's a step-by-step solution...",
            "Think of it this way: nature always tries to minimize energy. The phenomenon you're asking about is a direct consequence of this principle...",
          ]),
          isOfficial: true,
          isAccepted: true,
          createdAt: new Date(),
        },
      });

      await prisma.doubt.update({
        where: { id: doubt.id },
        data: { resolvedAt: new Date(), resolvedBy: teacher.id },
      });
    } catch { /* skip conflicts */ }
  }

  // ===========================================================
  // BATCH MATERIALS
  // ===========================================================
  console.log("Creating batch materials...");

  for (let bi = 0; bi < Math.min(batchData.length, 20); bi++) {
    for (let m = 0; m < SCALE.materialsPerBatch; m++) {
      await prisma.batchMaterial.create({
        data: {
          batchId: batchData[bi].id,
          title: pick(["Formula Sheet","Lecture Slides","Practice Problems","Reference Notes","Video Lecture","Handout"]),
          type: pick(["NOTE","VIDEO","PRACTICE_SET","REFERENCE","FORMULA_SHEET"]),
          description: `Study material for batch.`,
          fileUrl: `https://gravityphysics.example.com/materials/${batchData[bi].id}-${m}.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 100000,
          isFree: m === 0,
          uploadedBy: pick(teachers).id,
          views: Math.floor(Math.random() * 200),
          downloads: Math.floor(Math.random() * 50),
        },
      });
    }
  }

  // ===========================================================
  // NOTES
  // ===========================================================
  console.log("Creating notes...");

  const noteNames = [
    "Kinematics Complete Notes","Laws of Motion Short Notes","Thermodynamics Cheat Sheet",
    "Electrostatics Formula Sheet","Modern Physics Revision","Optics Quick Reference",
    "Waves & SHM Notes","Magnetism Summary","AC Circuits Notes","Nuclear Physics Overview",
  ];
  for (let i = 0; i < Math.min(noteNames.length, SCALE.notes); i++) {
    await prisma.note.create({
      data: {
        title: noteNames[i],
        slug: noteNames[i].toLowerCase().replace(/\s+/g, "-"),
        description: `Comprehensive ${noteNames[i].toLowerCase()}`,
        content: `${noteNames[i]}\n\nKey concepts and formulas.\n\n1. Definition\n2. Important Formulas\n3. Solved Examples`,
        subject: "Physics",
        topic: pick(PHYSICS_TOPICS),
        topics: [pick(PHYSICS_TOPICS)],
        teacherId: pick(teachers).id,
        batchId: pick(batchData).id,
        isPublic: true,
        difficulty: pick(["BEGINNER","INTERMEDIATE","ADVANCED"]),
        tags: ["Physics","JEE","NEET"],
        downloads: Math.floor(Math.random() * 300) + 10,
        views: Math.floor(Math.random() * 800) + 50,
        likes: Math.floor(Math.random() * 80) + 5,
      },
    });
  }

  // ===========================================================
  // REVIEWS
  // ===========================================================
  console.log("Creating batch reviews...");

  const reviewTexts = [
    "Excellent teaching! Concepts are very clear.",
    "Well-organized course structure.",
    "Great batch for JEE preparation.",
    "Very helpful practice problems.",
    "Improved my score significantly.",
    "Best online Physics coaching.",
    "Interactive sessions are great.",
    "Study materials are top-notch.",
  ];
  let reviewCount = 0;
  for (let bi = 0; bi < Math.min(batchData.length, 20); bi++) {
    const reviewStudents = pickN(studentData, 5 + (bi % 5));
    for (const s of reviewStudents) {
      try {
        await prisma.batchReview.create({
          data: {
            batchId: batchData[bi].id,
            studentId: s.sid,
            rating: 3 + Math.floor(Math.random() * 3),
            comment: pick(reviewTexts),
            pros: ["Clear explanations","Great material"],
            cons: Math.random() > 0.7 ? ["Could be more interactive"] : [],
            isVerified: Math.random() > 0.3,
          },
        });
        reviewCount++;
      } catch { /* unique */ }
    }
  }
  console.log(`  → ${reviewCount} reviews`);

  // ===========================================================
  // SUPPORT TICKETS
  // ===========================================================
  console.log("Creating support tickets...");

  for (let i = 0; i < SCALE.tickets; i++) {
    const si = Math.floor(Math.random() * studentData.length);
    const topic = pick(["TECHNICAL","PAYMENT","ACCOUNT","COURSE","OTHER"]);

    try {
      const ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber: `TKT-${Date.now()}-${i}`,
          userId: studentData[si].id,
          subject: pick(["Unable to access recordings","Payment not reflecting","Change batch","Account issue","Course content missing"]),
          description: `I am facing an issue with ${topic}. Please help resolve this at the earliest.`,
          category: topic,
          priority: pick(["LOW","MEDIUM","HIGH"]),
          status: i < 5 ? "OPEN" : "IN_PROGRESS",
          source: "WEBSITE",
          tags: ["student", topic.toLowerCase()],
        },
      });

      await prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: studentData[si].id,
          message: `I am facing an issue with ${topic}. Please help.`,
        },
      });

      if (i > 5) {
        await prisma.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            senderId: pick(teachers).userId,
            message: "Thank you for reaching out. We've noted your issue and will resolve it shortly.",
          },
        });
      }
    } catch { /* skip */ }
  }

  // ===========================================================
  // NOTIFICATIONS & PREFERENCES
  // ===========================================================
  console.log("Creating notifications...");

  const allUserIds = [
    ...teachers.map(t => t.userId),
    ...moderators.map(m => m.id), // these are moderator ids not user ids, need user ids
  ];
  // Get actual user IDs
  const allModeratorUsers = await prisma.moderator.findMany({ select: { userId: true } });
  const allStudentUsers = await prisma.student.findMany({ select: { userId: true }, take: 200 });
  const allUserIdsFinal = [
    ...teachers.map(t => t.userId),
    ...allModeratorUsers.map(m => m.userId),
    ...allStudentUsers.map(s => s.userId),
  ];

  // Notifications for first 200 users
  for (const uid of allUserIdsFinal.slice(0, 200)) {
    for (let i = 0; i < 3; i++) {
      await prisma.notification.create({
        data: {
          userId: uid,
          type: pick(["CLASS_REMINDER","EXAM_UPDATE","PAYMENT_REMINDER","RESULT_ANNOUNCEMENT","BATCH_UPDATE","GENERAL_ANNOUNCEMENT"]),
          channel: "INAPP",
          title: pick(["Upcoming Class","New Quiz Published","Fee Payment Due","Results Released","Schedule Updated","New Material Added"]),
          message: pick(["Your next class is at 6 AM.","A new quiz is available.","Fee payment due in 3 days.","Check your latest results!","Schedule has been updated.","New material uploaded."]),
          isRead: Math.random() > 0.5,
          createdAt: randomDate(new Date("2026-04-01"), new Date()),
        },
      });
    }
  }

  // Notification preferences
  for (const uid of allUserIdsFinal) {
    await prisma.notificationPreference.upsert({
      where: { userId: uid },
      update: {},
      create: {
        userId: uid,
        emailEnabled: true,
        smsEnabled: true,
        whatsappEnabled: false,
        inappEnabled: true,
        pushEnabled: true,
        preferences: {
          PAYMENT_REMINDER: true, EXAM_UPDATE: true,
          CLASS_REMINDER: true, RESULT_ANNOUNCEMENT: true,
        },
      },
    });
  }

  // ===========================================================
  // STUDENT PROGRESS
  // ===========================================================
  console.log("Creating student progress...");

  let progressCount = 0;
  for (const ep of enrollmentPairs.slice(0, 500)) {
    try {
      await prisma.studentProgress.create({
        data: {
          studentId: ep.studentId,
          batchId: ep.batchId,
          avgQuizScore: Math.floor(Math.random() * 50) + 30,
          avgExamScore: Math.floor(Math.random() * 50) + 30,
          attendance: Math.floor(Math.random() * 30) + 60,
          assignmentsCompleted: Math.floor(Math.random() * 8) + 2,
          totalAssignments: 10,
          improvementRate: Math.floor(Math.random() * 80) + 10,
          strongTopics: [pick(PHYSICS_TOPICS)],
          weakTopics: [pick(PHYSICS_TOPICS)],
          lastActive: randomDate(new Date("2026-04-01"), new Date()),
          totalStudyTime: Math.floor(Math.random() * 5000) + 500,
          loginCount: Math.floor(Math.random() * 50) + 5,
          resourceViews: Math.floor(Math.random() * 200) + 10,
          doubtCount: Math.floor(Math.random() * 15),
        },
      });
      progressCount++;
    } catch { /* unique */ }
  }
  console.log(`  → ${progressCount} progress records`);

  // ===========================================================
  // USER ACTIVITY
  // ===========================================================
  console.log("Creating user activity...");

  const activities = ["LOGIN","VIEW_BATCH","START_QUIZ","COMPLETE_QUIZ","VIEW_RESULT","DOWNLOAD_NOTE","WATCH_SESSION","SUBMIT_ASSIGNMENT","POST_DOUBT","VIEW_PAYMENT"];
  for (const s of studentData.slice(0, 200)) {
    for (let i = 0; i < 5; i++) {
      await prisma.userActivity.create({
        data: {
          userId: s.id,
          action: pick(activities),
          entity: pick(["Batch","Quiz","Note","Session","Assignment"]),
          metadata: { source: "seed" },
          ipAddress: "127.0.0.1",
          duration: Math.floor(Math.random() * 600) + 30,
        },
      });
    }
  }

  // ===========================================================
  // COUPONS
  // ===========================================================
  await prisma.coupon.createMany({
    data: [
      { code: "GRAVITY20", description: "20% off for new students", discountType: "PERCENTAGE", discountValue: 20, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31"), maxUses: 1000, usedCount: 150, minPurchase: 5000, maxDiscount: 10000, perUserLimit: 1, isActive: true },
      { code: "FLAT1000", description: "Flat 1000 off", discountType: "FIXED", discountValue: 1000, validFrom: new Date("2026-04-01"), validUntil: new Date("2026-06-30"), maxUses: 500, usedCount: 80, minPurchase: 8000, perUserLimit: 1, firstTimeOnly: true, isActive: true },
      { code: "REFERRAL500", description: "Referral discount", discountType: "FIXED", discountValue: 500, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31"), maxUses: 2000, usedCount: 230, perUserLimit: 10, isActive: true },
      { code: "SUMMER10", description: "Summer Sale 10%", discountType: "PERCENTAGE", discountValue: 10, validFrom: new Date("2026-05-01"), validUntil: new Date("2026-07-31"), maxUses: 300, usedCount: 45, minPurchase: 3000, maxDiscount: 5000, perUserLimit: 2, isActive: true },
      { code: "EARLYBIRD15", description: "Early bird 15%", discountType: "PERCENTAGE", discountValue: 15, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-03-31"), maxUses: 200, usedCount: 120, minPurchase: 10000, maxDiscount: 7500, perUserLimit: 1, firstTimeOnly: true, isActive: false },
      { code: "FESTIVE25", description: "Festive season 25%", discountType: "PERCENTAGE", discountValue: 25, validFrom: new Date("2026-10-01"), validUntil: new Date("2026-11-15"), maxUses: 150, usedCount: 0, minPurchase: 8000, maxDiscount: 15000, perUserLimit: 1, isActive: true },
      { code: "STUDENT2000", description: "Merit scholarship", discountType: "FIXED", discountValue: 2000, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31"), maxUses: 100, usedCount: 12, minPurchase: 15000, perUserLimit: 1, isActive: true },
      { code: "GROUP5", description: "Group of 5 discount", discountType: "PERCENTAGE", discountValue: 5, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31"), maxUses: 500, usedCount: 67, perUserLimit: 5, isActive: true },
      { code: "REPEAT15", description: "Repeat student 15%", discountType: "PERCENTAGE", discountValue: 15, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31"), maxUses: 300, usedCount: 34, minPurchase: 5000, maxDiscount: 8000, perUserLimit: 3, isActive: true },
      { code: "FREEACCESS", description: "Free batch access", discountType: "FIXED", discountValue: 0, validFrom: new Date("2026-01-01"), validUntil: new Date("2026-12-31"), maxUses: 50, usedCount: 8, applicableCourses: ["crs_003"], isActive: true },
    ],
  });

  // ===========================================================
  // LEADS (50)
  // ===========================================================
  const leadSources = ["Facebook","Website","WhatsApp","Google Ads","Referral","Instagram","Twitter","YouTube"];
  const leadStatuses = ["NEW","CONTACTED","QUALIFIED","CONVERTED","LOST"];
  const leadInterests = ["JEE Advanced","NEET","Class 11 Physics","Class 12 Physics","Physics Olympiad","BITSAT"];

  const leadData = [];
  for (let i = 0; i < SCALE.leads; i++) {
    leadData.push({
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      phone: `+9198767${pad(1000 + i, 4)}`,
      email: `lead${i}@example.com`,
      source: pick(leadSources),
      medium: pick(["ad","organic","campaign"]),
      campaign: pick(["summer_camp","free_workshop","search_campaign","referral_program"]),
      interest: pick(leadInterests),
      status: pick(leadStatuses),
      score: Math.floor(Math.random() * 100),
      notes: Math.random() > 0.7 ? `Interested in ${pick(["weekend","weekday","morning","evening"])} batch` : null,
    });
  }
  await prisma.lead.createMany({ data: leadData });

  // ===========================================================
  // SYSTEM CONFIG
  // ===========================================================
  await prisma.systemConfig.createMany({
    data: [
      { key: "app_name", value: "Gravity Physics Academy", category: "general", description: "Application display name", isPublic: true },
      { key: "support_email", value: "support@gravityphysics.com", category: "contact", description: "Support email", isPublic: true },
      { key: "support_phone", value: "+919876543210", category: "contact", description: "Support phone", isPublic: true },
      { key: "max_free_batches", value: 2, category: "limits", description: "Max free batches" },
      { key: "default_timezone", value: "Asia/Kolkata", category: "system", description: "Default timezone" },
      { key: "session_timeout_minutes", value: 1440, category: "security", description: "Session timeout" },
      { key: "maintenance_mode", value: false, category: "system", description: "Maintenance mode", isPublic: true },
      { key: "enrollment_deadline_days", value: 30, category: "enrollment", description: "Enrollment deadline" },
    ],
  });

  // ===========================================================
  // SUMMARY
  // ===========================================================
  const counts = {
    users: await prisma.user.count(),
    teachers: await prisma.teacher.count(),
    moderators: await prisma.moderator.count(),
    students: await prisma.student.count(),
    guardians: await prisma.guardian.count(),
    courses: await prisma.course.count(),
    batches: await prisma.batch.count(),
    batchSessions: await prisma.batchSession.count(),
    enrollments: await prisma.enrollment.count(),
    payments: await prisma.payment.count(),
    installments: await prisma.installment.count(),
    certificates: await prisma.certificate.count(),
    quizzes: await prisma.quiz.count(),
    questions: await prisma.question.count(),
    quizAttempts: await prisma.quizAttempt.count(),
    examResults: await prisma.examResult.count(),
    posts: await prisma.post.count(),
    comments: await prisma.comment.count(),
    postReactions: await prisma.postReaction.count(),
    commentReactions: await prisma.commentReaction.count(),
    blogs: await prisma.blog.count(),
    blogComments: await prisma.blogComment.count(),
    announcements: await prisma.announcement.count(),
    doubts: await prisma.doubt.count(),
    attendance: await prisma.attendance.count(),
    liveSessions: await prisma.liveSession.count(),
    assignments: await prisma.assignment.count(),
    batchMaterials: await prisma.batchMaterial.count(),
    notes: await prisma.note.count(),
    reviews: await prisma.batchReview.count(),
    supportTickets: await prisma.supportTicket.count(),
    coupons: await prisma.coupon.count(),
    leads: await prisma.lead.count(),
    systemConfig: await prisma.systemConfig.count(),
    notifications: await prisma.notification.count(),
    userActivity: await prisma.userActivity.count(),
    studentProgress: await prisma.studentProgress.count(),
  };

  console.log("\n✅ Seed completed successfully!");
  console.log(`\n📊 Database populated with:`);
  console.log(`   Users: ${counts.users} | Teachers: ${counts.teachers} | Students: ${counts.students} | Guardians: ${counts.guardians}`);
  console.log(`   Courses: ${counts.courses} | Batches: ${counts.batches} (${counts.batchSessions} sessions)`);
  console.log(`   Enrollments: ${counts.enrollments} | Payments: ${counts.payments} | Installments: ${counts.installments}`);
  console.log(`   Quizzes: ${counts.quizzes} (${counts.questions} qs, ${counts.quizAttempts} attempts)`);
  console.log(`   Exams: ${counts.examResults} results | Attendance: ${counts.attendance}`);
  console.log(`   Posts: ${counts.posts} | Comments: ${counts.comments} | Reactions: ${counts.postReactions}`);
  console.log(`   Blogs: ${counts.blogs} | Announcements: ${counts.announcements} | Doubts: ${counts.doubts}`);
  console.log(`   Live Sessions: ${counts.liveSessions} | Assignments: ${counts.assignments}`);
  console.log(`   Notes: ${counts.notes} | Materials: ${counts.batchMaterials} | Reviews: ${counts.reviews}`);
  console.log(`   Certificates: ${counts.certificates} | Tickets: ${counts.supportTickets}`);
  console.log(`   Coupons: ${counts.coupons} | Leads: ${counts.leads} | Notifications: ${counts.notifications}`);
  console.log(`   Activity: ${counts.userActivity} | Progress: ${counts.studentProgress}`);
  console.log(`\n🔑 All accounts use password: Test@1234`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
