import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getZakatSummary, getHistoricalSummary } from "@/lib/zakat";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [summary, history] = await Promise.all([
            getZakatSummary(session.user.id),
            getHistoricalSummary(session.user.id, 3),
        ]);

        return NextResponse.json({
            summary,
            history,
        });
    } catch (error) {
        console.error("Zakat Summary Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch Zakat summary" },
            { status: 500 }
        );
    }
}
