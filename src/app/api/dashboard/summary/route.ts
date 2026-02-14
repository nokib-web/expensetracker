import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // Get total income
        const totalIncome = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'INCOME',
            },
            _sum: {
                amount: true,
            },
        });

        // Get total expenses
        const totalExpenses = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'EXPENSE',
            },
            _sum: {
                amount: true,
            },
        });

        // Get this month's income
        const thisMonthIncome = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'INCOME',
                transactionDate: {
                    gte: thisMonthStart,
                    lte: thisMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        // Get this month's expenses
        const thisMonthExpenses = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'EXPENSE',
                transactionDate: {
                    gte: thisMonthStart,
                    lte: thisMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        // Get last month's income
        const lastMonthIncome = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'INCOME',
                transactionDate: {
                    gte: lastMonthStart,
                    lte: lastMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

        // Get last month's expenses
        const lastMonthExpenses = await prisma.transaction.aggregate({
            where: {
                userId,
                type: 'EXPENSE',
                transactionDate: {
                    gte: lastMonthStart,
                    lte: lastMonthEnd,
                },
            },
            _sum: {
                amount: true,
            },
        });

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
        const categoryIds = topCategories.map((c) => c.categoryId);
        const categories = await prisma.category.findMany({
            where: {
                id: {
                    in: categoryIds,
                },
            },
        });

        const topSpendingCategories = topCategories.map((tc) => {
            const category = categories.find((c) => c.id === tc.categoryId);
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

        const totalIncomeNum = Number(totalIncome._sum.amount || 0);
        const totalExpensesNum = Number(totalExpenses._sum.amount || 0);
        const currentBalance = totalIncomeNum - totalExpensesNum;

        let zakatDue = 0;
        let zakatEligible = false;

        if (zakatSettings && currentBalance >= Number(zakatSettings.nisabAmount)) {
            zakatEligible = true;
            zakatDue = currentBalance * (Number(zakatSettings.zakatRate) / 100);
        }

        // Calculate percentage changes
        const thisMonthIncomeNum = Number(thisMonthIncome._sum.amount || 0);
        const thisMonthExpensesNum = Number(thisMonthExpenses._sum.amount || 0);
        const lastMonthIncomeNum = Number(lastMonthIncome._sum.amount || 0);
        const lastMonthExpensesNum = Number(lastMonthExpenses._sum.amount || 0);

        const incomeChange =
            lastMonthIncomeNum > 0
                ? ((thisMonthIncomeNum - lastMonthIncomeNum) / lastMonthIncomeNum) * 100
                : 0;

        const expenseChange =
            lastMonthExpensesNum > 0
                ? ((thisMonthExpensesNum - lastMonthExpensesNum) / lastMonthExpensesNum) * 100
                : 0;

        return NextResponse.json({
            totalIncome: totalIncomeNum,
            totalExpenses: totalExpensesNum,
            currentBalance,
            thisMonthIncome: thisMonthIncomeNum,
            thisMonthExpenses: thisMonthExpensesNum,
            incomeChange,
            expenseChange,
            topSpendingCategories,
            recentTransactions: recentTransactions.map((t) => ({
                id: t.id,
                type: t.type,
                amount: Number(t.amount),
                categoryName: t.category.name,
                description: t.description,
                transactionDate: t.transactionDate,
            })),
            zakatEligible,
            zakatDue,
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard summary' },
            { status: 500 }
        );
    }
}
