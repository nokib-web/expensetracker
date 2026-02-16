import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export interface ZakatSummary {
    totalAssets: Decimal;
    netBalance: Decimal;
    eligibleAmount: Decimal;
    nisabAmount: Decimal;
    meetsNisab: boolean;
    zakatPayable: Decimal;
    zakatPaid: Decimal;
    zakatDue: Decimal;
    zakatRate: Decimal;
}

export async function calculateTotalAssets(userId: string): Promise<Decimal> {
    const assets = await prisma.zakatAsset.aggregate({
        where: { userId },
        _sum: {
            amount: true,
        },
    });

    return assets._sum.amount || new Decimal(0);
}

export async function calculateNetBalance(userId: string): Promise<Decimal> {
    const result = await prisma.transaction.aggregate({
        where: { userId },
        _sum: {
            amount: true,
        },
    });

    // This is a bit tricky because we need to separate income and expense
    // aggregate doesn't easily support conditional sums in one go for multiple types
    // unless we use groupBy or multiple queries.

    const income = await prisma.transaction.aggregate({
        where: { userId, type: 'INCOME' },
        _sum: { amount: true },
    });

    const expense = await prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
    });

    const totalIncome = income._sum.amount || new Decimal(0);
    const totalExpense = expense._sum.amount || new Decimal(0);

    return totalIncome.minus(totalExpense);
}

export async function calculateZakatEligibleAmount(userId: string): Promise<Decimal> {
    const totalAssets = await calculateTotalAssets(userId);
    const netBalance = await calculateNetBalance(userId);

    // Zakat-eligible amount = assets + positive balance
    const balanceToAdd = netBalance.greaterThan(0) ? netBalance : new Decimal(0);

    return totalAssets.plus(balanceToAdd);
}

export async function checkNisabEligibility(userId: string): Promise<boolean> {
    const settings = await prisma.zakatSettings.findUnique({
        where: { userId },
    });

    if (!settings) return false;

    const eligibleAmount = await calculateZakatEligibleAmount(userId);
    return eligibleAmount.greaterThanOrEqualTo(settings.nisabAmount);
}

export async function calculateZakatPayable(userId: string): Promise<Decimal> {
    const settings = await prisma.zakatSettings.findUnique({
        where: { userId },
    });

    if (!settings) return new Decimal(0);

    const eligibleAmount = await calculateZakatEligibleAmount(userId);

    if (eligibleAmount.lessThan(settings.nisabAmount)) {
        return new Decimal(0);
    }

    const rate = settings.zakatRate.dividedBy(100);
    return eligibleAmount.times(rate);
}

export async function getZakatPaid(userId: string, year?: number): Promise<Decimal> {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const payments = await prisma.zakatPayment.aggregate({
        where: {
            userId,
            paymentDate: {
                gte: startDate,
                lte: endDate,
            },
        },
        _sum: {
            amountPaid: true,
        },
    });

    return payments._sum.amountPaid || new Decimal(0);
}

export async function getZakatDue(userId: string): Promise<Decimal> {
    const payable = await calculateZakatPayable(userId);
    const paid = await getZakatPaid(userId);

    const due = payable.minus(paid);
    return due.greaterThan(0) ? due : new Decimal(0);
}

export async function getZakatSummary(userId: string): Promise<ZakatSummary> {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const [assetsAgg, transAgg, settings, paymentsAgg] = await Promise.all([
        prisma.zakatAsset.aggregate({
            where: { userId },
            _sum: { amount: true },
        }),
        prisma.transaction.groupBy({
            by: ['type'],
            where: { userId },
            _sum: { amount: true },
        }),
        prisma.zakatSettings.findUnique({ where: { userId } }),
        prisma.zakatPayment.aggregate({
            where: {
                userId,
                paymentDate: { gte: startDate, lte: endDate },
            },
            _sum: { amountPaid: true },
        }),
    ]);

    const totalAssets = assetsAgg._sum.amount || new Decimal(0);
    const income = transAgg.find(t => t.type === 'INCOME')?._sum.amount || new Decimal(0);
    const expense = transAgg.find(t => t.type === 'EXPENSE')?._sum.amount || new Decimal(0);
    const netBalance = income.minus(expense);
    const balanceToAdd = netBalance.greaterThan(0) ? netBalance : new Decimal(0);
    const eligibleAmount = totalAssets.plus(balanceToAdd);

    const nisabAmount = settings?.nisabAmount || new Decimal(0);
    const zakatRate = settings?.zakatRate || new Decimal(2.5);
    const meetsNisab = eligibleAmount.greaterThanOrEqualTo(nisabAmount);

    const zakatPayable = meetsNisab
        ? eligibleAmount.times(zakatRate.dividedBy(100))
        : new Decimal(0);

    const zakatPaid = paymentsAgg._sum.amountPaid || new Decimal(0);
    const dueValue = zakatPayable.minus(zakatPaid);
    const zakatDue = dueValue.greaterThan(0) ? dueValue : new Decimal(0);

    return {
        totalAssets,
        netBalance,
        eligibleAmount,
        nisabAmount,
        meetsNisab,
        zakatPayable,
        zakatPaid,
        zakatDue,
        zakatRate,
    };
}

export async function getHistoricalSummary(userId: string, years: number = 3) {
    const currentYear = new Date().getFullYear();
    const summaryPromises = [];

    for (let i = 0; i < years; i++) {
        const year = currentYear - i;
        summaryPromises.push(
            getZakatPaid(userId, year).then((paid) => ({
                year,
                amountPaid: paid,
            }))
        );
    }

    return Promise.all(summaryPromises);
}
