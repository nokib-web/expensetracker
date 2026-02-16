import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ transactions: [], categories: [], zakatAssets: [] });
    }

    try {
        // Search Transactions
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                OR: [
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: {
                category: true,
            },
            take: 10,
            orderBy: { transactionDate: 'desc' },
        });

        // Search Categories
        const categories = await prisma.category.findMany({
            where: {
                userId: session.user.id,
                name: { contains: query, mode: 'insensitive' },
            },
            include: {
                _count: {
                    select: { transactions: true }
                }
            },
            take: 5,
        });

        // Search Zakat Assets
        const zakatAssets = await prisma.zakatAsset.findMany({
            where: {
                userId: session.user.id,
                source: {
                    // AssetSource is an enum, we convert query to uppercase for exact matches if it matches enum values
                    // but for partial matches we are limited. 
                    // However, we can use the source field directly if it was a string.
                    // Since it's an enum, we'll just check if the query matches an enum value roughly
                    in: Object.values(['CASH', 'SAVINGS', 'GOLD', 'INVESTMENT']).filter(s => s.toLowerCase().includes(query.toLowerCase())) as any
                }
            },
            take: 5,
        });

        return NextResponse.json({
            transactions,
            categories,
            zakatAssets,
        });
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
