import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        const asset = await prisma.zakatAsset.findUnique({
            where: { id },
        });

        if (!asset || asset.userId !== session.user.id) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        const updatedAsset = await prisma.zakatAsset.update({
            where: { id },
            data: {
                source: body.source,
                amount: body.amount,
                date: body.date ? new Date(body.date) : asset.date,
            },
        });

        return NextResponse.json(updatedAsset);
    } catch (error) {
        console.error("Zakat Asset Update Error:", error);
        return NextResponse.json(
            { error: "Failed to update Zakat asset" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const asset = await prisma.zakatAsset.findUnique({
            where: { id },
        });

        if (!asset || asset.userId !== session.user.id) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        await prisma.zakatAsset.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Zakat Asset Delete Error:", error);
        return NextResponse.json(
            { error: "Failed to delete Zakat asset" },
            { status: 500 }
        );
    }
}
