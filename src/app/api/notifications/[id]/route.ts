import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const { isRead } = await req.json();

        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification || notification.userId !== session.user.id) {
            return NextResponse.json({ error: "Notification not found" }, { status: 404 });
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }
}
