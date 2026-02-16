import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssetSource } from "@prisma/client";
import { z } from "zod";

const assetSchema = z.object({
    source: z.nativeEnum(AssetSource),
    amount: z.number().positive(),
    date: z.string().optional(),
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = assetSchema.parse(body);

        const asset = await prisma.zakatAsset.create({
            data: {
                userId: session.user.id,
                source: validatedData.source,
                amount: validatedData.amount,
                date: validatedData.date ? new Date(validatedData.date) : new Date(),
            },
        });

        return NextResponse.json(asset);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error("Zakat Asset Create Error:", error);
        return NextResponse.json(
            { error: "Failed to create Zakat asset" },
            { status: 500 }
        );
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const assets = await prisma.zakatAsset.findMany({
            where: { userId: session.user.id },
            orderBy: { date: "desc" },
        });

        // Group by source
        const groupedAssets = assets.reduce((acc, asset) => {
            const source = asset.source;
            if (!acc[source]) {
                acc[source] = [];
            }
            acc[source].push(asset);
            return acc;
        }, {} as Record<string, typeof assets>);

        return NextResponse.json(groupedAssets);
    } catch (error) {
        console.error("Zakat Assets Fetch Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch Zakat assets" },
            { status: 500 }
        );
    }
}
