// src/app/api/batches/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// GET /api/batches - Get all batches
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(
      req,
      "ADMIN",
      "SUPER_ADMIN",
      "TEACHER",
      "STUDENT",
    );

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const subject = searchParams.get("subject");
    const mode = searchParams.get("mode");
    const teacherId = searchParams.get("teacherId");
    const courseId = searchParams.get("courseId");
    const isActive = searchParams.get("isActive");
    const enrollmentOpen = searchParams.get("enrollmentOpen");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const startDateFrom = searchParams.get("startDateFrom");
    const startDateTo = searchParams.get("startDateTo");

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    if (subject) where.subject = subject;
    if (mode) where.mode = mode;
    if (teacherId) where.teacherId = teacherId;
    if (courseId) where.courseId = courseId;
    if (isActive !== null) where.isActive = isActive === "true";
    if (enrollmentOpen !== null)
      where.enrollmentOpen = enrollmentOpen === "true";

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) where.startDate.gte = new Date(startDateFrom);
      if (startDateTo) where.startDate.lte = new Date(startDateTo);
    }

    // If user is teacher, only show their batches
    if (auth.user?.role === "TEACHER") {
      where.teacherId = auth.user.teacherId;
    }

    // If user is student, only show batches they're enrolled in or public batches
    if (auth.user?.role === "STUDENT") {
      where.OR = [
        { enrollments: { some: { studentId: auth.user.studentId } } },
        { visibility: "PUBLIC", isActive: true, enrollmentOpen: true },
      ];
    }

    // Get batches with pagination
    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: "asc" },
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              qualification: true,
              profileImage: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          moderators: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              notes: true,
              quizzes: true,
              exams: true,
            },
          },
        },
      }),
      prisma.batch.count({ where }),
    ]);

    // Add enrollment status for students
    let enhancedBatches = batches;
    if (auth.user?.role === "STUDENT" && auth.user.studentId) {
      const studentEnrollments = await prisma.enrollment.findMany({
        where: { studentId: auth.user.studentId },
        select: { batchId: true, status: true },
      });

      const enrollmentMap = new Map(
        studentEnrollments.map((e) => [e.batchId, e.status]),
      );

      enhancedBatches = batches.map((batch) => ({
        ...batch,
        studentEnrollmentStatus: enrollmentMap.get(batch.id) || null,
      }));
    }

    const totalPages = Math.ceil(total / limit);

    return sendResponse({
      success: true,
      message: "Batches fetched successfully",
      data: enhancedBatches,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}

// POST /api/batches - Create a new batch
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN", "TEACHER");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.subject || !body.courseId || !body.startDate) {
      return sendResponse({
        success: false,
        message: "Missing required fields: name, subject, courseId, startDate",
        status: 400,
      });
    }

    // Generate slug from name
    const slug =
      body.slug ||
      body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
    });

    if (!course) {
      return sendResponse({
        success: false,
        message: "Course not found",
        status: 400,
      });
    }

    // Determine teacherId
    let teacherId = body.teacherId;
    if (auth.user?.role === "TEACHER") {
      teacherId = auth.user.teacherId;
    }

    if (!teacherId) {
      return sendResponse({
        success: false,
        message: "teacherId is required",
        status: 400,
      });
    }

    // Create batch
    const batch = await prisma.batch.create({
      data: {
        name: body.name,
        slug,
        courseId: body.courseId,
        teacherId,
        subject: body.subject,
        description: body.description,
        mode: body.mode || "ONLINE",
        language: body.language || "English",
        maxStudents: body.maxStudents,
        minimumStudents: body.minimumStudents,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        schedule: body.schedule,
        totalClasses: body.totalClasses,
        liveClassLink: body.liveClassLink,
        liveClassPlatform: body.liveClassPlatform,
        meetingId: body.meetingId,
        meetingPassword: body.meetingPassword,
        recordingUrl: body.recordingUrl,
        studyMaterialUrl: body.studyMaterialUrl,
        resources: body.resources,
        price: body.price || 0,
        offerPrice: body.offerPrice,
        offerDeadline: body.offerDeadline ? new Date(body.offerDeadline) : null,
        earlyBirdPrice: body.earlyBirdPrice,
        earlyBirdDeadline: body.earlyBirdDeadline
          ? new Date(body.earlyBirdDeadline)
          : null,
        discountPercent: body.discountPercent,
        discountCode: body.discountCode,
        isActive: body.isActive ?? true,
        isPublished: body.isPublished ?? false,
        enrollmentOpen: body.enrollmentOpen ?? true,
        visibility: body.visibility || "PUBLIC",
        syllabus: body.syllabus,
        topics: body.topics || [],
        prerequisites: body.prerequisites || [],
      },
      include: {
        teacher: {
          select: {
            name: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    return sendResponse({
      success: true,
      message: "Batch created successfully",
      data: batch,
      status: 201,
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
