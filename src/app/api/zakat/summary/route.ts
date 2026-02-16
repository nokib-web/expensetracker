import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getZakatSummary, getHistoricalSummary } from "@/lib/zakat";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
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
                    `Your current total wealth ($${summary.totalAssets.toFixed(2)}) has exceeded the Nisab threshold. Your calculated Zakat due is $${summary.zakatDue.toFixed(2)}.`,
                    '/zakat'
                );
            }
        }

        return NextResponse.json({
            summary,
            history,
        });
    } catch (error) {
        console.error("Zakat Summary Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch Zakat summary" },
            { status: 500 }
        );
    }
}
