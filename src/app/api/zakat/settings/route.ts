import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ZakatSettingsSchema } from "@/lib/validations";
import { withErrorHandler, UnauthorizedError, ValidationError } from "@/lib/errors";

export const PUT = withErrorHandler(async (req: Request) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const body = await req.json();
    const validatedData = ZakatSettingsSchema.partial().safeParse(body);

    if (!validatedData.success) {
        throw new ValidationError(validatedData.error.issues[0].message);
    }

    const settings = await prisma.zakatSettings.upsert({
        where: { userId: session.user.id },
        update: validatedData.data,
        create: {
            userId: session.user.id,
            nisabAmount: validatedData.data.nisabAmount || 0,
            zakatRate: validatedData.data.zakatRate || 2.5,
            calculationMethod: validatedData.data.calculationMethod || 'AUTOMATIC',
        },
    });

    return NextResponse.json({
        success: true,
        data: settings
    });
});
