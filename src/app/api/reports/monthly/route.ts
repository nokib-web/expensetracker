import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval } from "date-fns";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const monthStr = searchParams.get("month");
    const yearStr = searchParams.get("year");

    const today = new Date();
    const month = monthStr ? parseInt(monthStr) : today.getMonth();
    const year = yearStr ? parseInt(yearStr) : today.getFullYear();

    const currentMonthStart = new Date(year, month, 1);
    const currentMonthEnd = endOfMonth(currentMonthStart);
    const prevMonthStart = startOfMonth(subMonths(currentMonthStart, 1));
    const prevMonthEnd = endOfMonth(prevMonthStart);

    try {
        // Current Month Data
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                transactionDate: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
            include: {
                category: true,
            },
            orderBy: {
                transactionDate: "desc",
            },
        });

        // Previous Month Totals for comparison
        const prevMonthAgg = await prisma.transaction.groupBy({
            by: ["type"],
            where: {
                userId: session.user.id,
                transactionDate: {
                    gte: prevMonthStart,
                    lte: prevMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        const currentMonthAgg = await prisma.transaction.groupBy({
            by: ["type"],
            where: {
                userId: session.user.id,
                transactionDate: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        // Category Breakdown
        const categoryBreakdown = await prisma.transaction.groupBy({
            by: ["categoryId", "type"],
            where: {
                userId: session.user.id,
                transactionDate: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        // Get category names
        const categories = await prisma.category.findMany({
            where: {
                id: { in: categoryBreakdown.map(b => b.categoryId) }
            }
        });

        const categoryStats = categoryBreakdown.map(b => ({
            ...b,
            categoryName: categories.find(c => c.id === b.categoryId)?.name || "Unknown",
            amount: Number(b._sum.amount || 0),
        })).sort((a, b) => b.amount - a.amount);

        // Daily totals
        const days = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd });
        const dailyTotals = days.map(day => {
            const dayStr = format(day, "yyyy-MM-dd");
            const dayTransactions = transactions.filter(t =>
                format(new Date(t.transactionDate), "yyyy-MM-dd") === dayStr
            );

            const income = dayTransactions
                .filter(t => t.type === "INCOME")
                .reduce((sum, t) => sum + Number(t.amount), 0);

            const expense = dayTransactions
                .filter(t => t.type === "EXPENSE")
                .reduce((sum, t) => sum + Number(t.amount), 0);

            return {
                date: dayStr,
                income,
                expense,
            };
        });

        const totalIncome = Number(currentMonthAgg.find(a => a.type === "INCOME")?._sum.amount || 0);
        const totalExpense = Number(currentMonthAgg.find(a => a.type === "EXPENSE")?._sum.amount || 0);
        const prevIncome = Number(prevMonthAgg.find(a => a.type === "INCOME")?._sum.amount || 0);
        const prevExpense = Number(prevMonthAgg.find(a => a.type === "EXPENSE")?._sum.amount || 0);

        const netSavings = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
        const expenseChange = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;

        const biggestExpense = transactions
            .filter(t => t.type === "EXPENSE")
            .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

        const biggestIncome = transactions
            .filter(t => t.type === "INCOME")
            .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

        return NextResponse.json({
            summary: {
                totalIncome,
                totalExpense,
                netSavings,
                savingsRate,
                incomeChange,
                expenseChange,
                avgDailySpending: totalExpense / days.length,
            },
            categoryStats: {
                income: categoryStats.filter(s => s.type === "INCOME"),
                expense: categoryStats.filter(s => s.type === "EXPENSE"),
            },
            dailyTotals,
            biggestTransactions: {
                income: biggestIncome,
                expense: biggestExpense,
            },
            transactions,
        });
    } catch (error) {
        console.error("Monthly Report Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
