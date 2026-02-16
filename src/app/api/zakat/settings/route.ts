import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalculationMethod } from "@prisma/client";
import { z } from "zod";

const settingsSchema = z.object({
    nisabAmount: z.number().positive().optional(),
    zakatRate: z.number().min(0).max(100).optional(),
    calculationMethod: z.nativeEnum(CalculationMethod).optional(),
});

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = settingsSchema.parse(body);

        const settings = await prisma.zakatSettings.upsert({
            where: { userId: session.user.id },
            update: validatedData,
            create: {
                userId: session.user.id,
                nisabAmount: validatedData.nisabAmount || 0,
                zakatRate: validatedData.zakatRate || 2.5,
                calculationMethod: validatedData.calculationMethod || CalculationMethod.AUTOMATIC,
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Zakat Settings Update Error:", error);
        return NextResponse.json(
            { error: "Failed to update Zakat settings" },
            { status: 500 }
        );
    }
}
