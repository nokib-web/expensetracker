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
        let preferences = await prisma.notificationPreference.findUnique({
            where: { userId: session.user.id },
        });

        if (!preferences) {
            // Initialize default preferences if not found
            preferences = await prisma.notificationPreference.create({
                data: {
                    userId: session.user.id,
                },
            });
        }

        return NextResponse.json(preferences);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const { id, userId, updatedAt, ...updatableFields } = data;

        const preferences = await prisma.notificationPreference.upsert({
            where: { userId: session.user.id },
            update: updatableFields,
            create: {
                ...updatableFields,
                userId: session.user.id,
            },
        });

        return NextResponse.json(preferences);
    } catch (error) {
        console.error("Preferences Update Error:", error);
        return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }
}
