// src/app/api/payments/reminders/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/apiAuthenticator";
import { sendResponse } from "@/lib/sendResponse";

// POST /api/payments/reminders - Send payment reminders
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req, "ADMIN", "SUPER_ADMIN");

    if (!auth.success) {
      return sendResponse({
        success: false,
        message: auth.error || "Unauthorized",
        status: auth.status || 401,
      });
    }

    const body = await req.json();
    const { daysBefore = 7 } = body;

    // Find upcoming due payments
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysBefore);

    const upcomingDuePayments = await prisma.payment.findMany({
      where: {
        dueDate: {
          lte: dueDate,
          gte: new Date(),
        },
        status: "PENDING",
        remindersSent: { lt: 3 }, // Max 3 reminders
      },
      include: {
        student: true,
        enrollment: {
          include: {
            batch: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Send reminders (you would implement actual email/SMS sending here)
    const reminders = await Promise.all(
      upcomingDuePayments.map(async (payment) => {
        // Update reminder count
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            remindersSent: { increment: 1 },
            lastReminderSent: new Date(),
          },
        });

        return {
          paymentId: payment.id,
          studentName: payment.student.name,
          studentEmail: payment.student.email,
          studentPhone: payment.student.phone,
          batchName: payment.enrollment.batch.name,
          dueDate: payment.dueDate,
          amount: payment.amount,
          daysUntilDue: Math.ceil(
            (payment.dueDate!.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        };
      }),
    );

    return sendResponse({
      success: true,
      message: `Sent ${reminders.length} payment reminders`,
      data: reminders,
    });
  } catch (error) {
    console.error("Error sending payment reminders:", error);
    return sendResponse({
      success: false,
      message: "Internal server error",
      status: 500,
    });
  }
}
