import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfYear, endOfYear, format } from "date-fns";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const yearStr = searchParams.get("year");
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 11, 31));

    try {
        const transactions = await prisma.transaction.groupBy({
            by: ["type", "transactionDate"],
            where: {
                userId: session.user.id,
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                amount: true,
            },
        });

        // Group by month
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const monthDate = new Date(year, i, 1);
            const monthName = format(monthDate, "MMM");

            const monthTransactions = transactions.filter(t =>
                new Date(t.transactionDate).getMonth() === i
            );

            const income = monthTransactions
                .filter(t => t.type === "INCOME")
                .reduce((sum, t) => sum + Number(t._sum.amount || 0), 0);

            const expense = monthTransactions
                .filter(t => t.type === "EXPENSE")
                .reduce((sum, t) => sum + Number(t._sum.amount || 0), 0);

            return {
                month: monthName,
                income,
                expense,
                savings: income - expense,
            };
        });

        const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
        const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);

        const highestIncomeMonth = [...monthlyData].sort((a, b) => b.income - a.income)[0];
        const highestExpenseMonth = [...monthlyData].sort((a, b) => b.expense - a.expense)[0];
        const lowestExpenseMonth = [...monthlyData].sort((a, b) => a.expense - b.expense)[0];

        return NextResponse.json({
            year,
            monthlyData,
            summary: {
                totalIncome,
                totalExpense,
                netSavings: totalIncome - totalExpense,
                avgMonthlyIncome: totalIncome / 12,
                avgMonthlyExpense: totalExpense / 12,
                highestIncomeMonth,
                highestExpenseMonth,
                lowestExpenseMonth,
            },
        });
    } catch (error) {
        console.error("Yearly Report Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
