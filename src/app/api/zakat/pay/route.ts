import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getZakatSummary } from "@/lib/zakat";
import { z } from "zod";

const paymentSchema = z.object({
    amountPaid: z.number().positive(),
    paymentDate: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = paymentSchema.parse(body);

        await prisma.zakatPayment.create({
            data: {
                userId: session.user.id,
                amountPaid: validatedData.amountPaid,
                paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : new Date(),
                notes: validatedData.notes,
            },
        });

        const summary = await getZakatSummary(session.user.id);

        return NextResponse.json({
            success: true,
            summary,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Zakat Payment Create Error:", error);
        return NextResponse.json(
            { error: "Failed to process Zakat payment" },
            { status: 500 }
        );
    }
}
