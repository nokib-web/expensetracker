import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, isFirstDayOfMonth, format } from 'date-fns';
import { createNotification } from '@/lib/notifications';
import { withErrorHandler, UnauthorizedError } from '@/lib/errors';

export const GET = withErrorHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const userId = session.user.id;
    const now = new Date();

    // Monthly Summary Trigger
    if (isFirstDayOfMonth(now)) {
        const lastMonth = subMonths(now, 1);
        const monthName = format(lastMonth, 'MMMM yyyy');

        const existingNotification = await prisma.notification.findFirst({
            where: {
                userId,
                type: 'MONTHLY_SUMMARY',
                createdAt: {
                    gte: startOfMonth(now)
                }
            }
        });

        if (!existingNotification) {
            await createNotification(
                userId,
                'MONTHLY_SUMMARY',
                '📊 Monthly Summary Ready',
                `Your financial summary for ${monthName} is now ready for review in the reports section.`,
                '/reports'
            );
        }
    }
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Optimized aggregate queries using groupBy
    const totalAggs = await prisma.transaction.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { amount: true },
    });

    const thisMonthAggs = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
            userId,
            transactionDate: { gte: thisMonthStart, lte: thisMonthEnd }
        },
        _sum: { amount: true },
    });

    const lastMonthAggs = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
            userId,
            transactionDate: { gte: lastMonthStart, lte: lastMonthEnd }
        },
        _sum: { amount: true },
    });

    const getSum = (arr: any[], type: 'INCOME' | 'EXPENSE') =>
        Number(arr.find(a => a.type === type)?._sum.amount || 0);

    const totalIncomeNum = getSum(totalAggs, 'INCOME');
    const totalExpensesNum = getSum(totalAggs, 'EXPENSE');
    const thisMonthIncomeNum = getSum(thisMonthAggs, 'INCOME');
    const thisMonthExpensesNum = getSum(thisMonthAggs, 'EXPENSE');
    const lastMonthIncomeNum = getSum(lastMonthAggs, 'INCOME');
    const lastMonthExpensesNum = getSum(lastMonthAggs, 'EXPENSE');

    // Get top spending categories
    const topCategories = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
            userId,
            type: 'EXPENSE',
        },
        _sum: {
            amount: true,
        },
        orderBy: {
            _sum: {
                amount: 'desc',
            },
        },
        take: 5,
    });

    // Get category details for top categories
    const categoryIds = topCategories.map((c: any) => c.categoryId);
    const categories = await prisma.category.findMany({
        where: {
            id: {
                in: categoryIds,
            },
        },
    });

    const topSpendingCategories = topCategories.map((tc: any) => {
        const category = categories.find((c: any) => c.id === tc.categoryId);
        return {
            categoryId: tc.categoryId,
            categoryName: category?.name || 'Unknown',
            amount: Number(tc._sum.amount || 0),
        };
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
        where: {
            userId,
        },
        include: {
            category: true,
        },
        orderBy: {
            transactionDate: 'desc',
        },
        take: 10,
    });

    // Get Zakat settings and calculate eligibility
    const zakatSettings = await prisma.zakatSettings.findUnique({
        where: {
            userId,
        },
    });

    const currentBalance = totalIncomeNum - totalExpensesNum;

    let zakatDue = 0;
    let zakatEligible = false;

    if (zakatSettings && currentBalance >= Number(zakatSettings.nisabAmount)) {
        zakatEligible = true;
        zakatDue = currentBalance * (Number(zakatSettings.zakatRate) / 100);
    }

    // Calculate percentage changes
    const incomeChange =
        lastMonthIncomeNum > 0
            ? ((thisMonthIncomeNum - lastMonthIncomeNum) / lastMonthIncomeNum) * 100
            : 0;

    const expenseChange =
        lastMonthExpensesNum > 0
            ? ((thisMonthExpensesNum - lastMonthExpensesNum) / lastMonthExpensesNum) * 100
            : 0;

    return NextResponse.json({
        success: true,
        totalIncome: totalIncomeNum,
        totalExpenses: totalExpensesNum,
        currentBalance,
        thisMonthIncome: thisMonthIncomeNum,
        thisMonthExpenses: thisMonthExpensesNum,
        incomeChange,
        expenseChange,
        topSpendingCategories,
        recentTransactions: recentTransactions.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            categoryName: t.category.name,
            description: t.description,
            transactionDate: t.transactionDate,
        })),
        zakatEligible,
        zakatDue,
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
    });
});
