import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withErrorHandler, UnauthorizedError } from "@/lib/errors";

export const GET = withErrorHandler(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const notifications = await prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    return NextResponse.json({
        success: true,
        data: notifications
    });
});

export const DELETE = withErrorHandler(async () => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    await prisma.notification.deleteMany({
        where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true, message: 'Notifications cleared' });
});
