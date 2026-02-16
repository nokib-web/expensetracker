import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payments = await prisma.zakatPayment.findMany({
            where: { userId: session.user.id },
            orderBy: { paymentDate: "desc" },
        });

        // Group by year and include totals
        const history = payments.reduce((acc, payment) => {
            const year = new Date(payment.paymentDate).getFullYear();
            if (!acc[year]) {
                acc[year] = {
                    payments: [],
                    totalPaid: 0,
                };
            }
            acc[year].payments.push(payment);
            acc[year].totalPaid += Number(payment.amountPaid);
            return acc;
        }, {} as Record<number, { payments: typeof payments, totalPaid: number }>);

        return NextResponse.json(history);
    } catch (error) {
        console.error("Zakat Payments Fetch Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch Zakat payments" },
            { status: 500 }
        );
    }
}
