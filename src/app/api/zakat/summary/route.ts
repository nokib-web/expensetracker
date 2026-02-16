import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getZakatSummary, getHistoricalSummary } from "@/lib/zakat";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

export const GET = withErrorHandler(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const [summary, history] = await Promise.all([
        getZakatSummary(session.user.id),
        getHistoricalSummary(session.user.id, 3),
    ]);

    // Trigger Notification if Zakat is due and no notification sent recently
    if (summary.meetsNisab && Number(summary.zakatDue) > 0) {
        // Check if we already sent a Zakat notification in the last 24 hours
        const recentNotification = await prisma.notification.findFirst({
            where: {
                userId: session.user.id,
                type: 'ZAKAT_DUE',
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        });

        if (!recentNotification) {
            await createNotification(
                session.user.id,
                'ZAKAT_DUE',
                '⚡ Zakat is Due!',
                `Your current total wealth has exceeded the Nisab threshold. Your calculated Zakat due is $${Number(summary.zakatDue).toFixed(2)}.`,
                '/zakat'
            );
        }
    }

    return NextResponse.json({
        success: true,
        summary,
        history,
    });
});
