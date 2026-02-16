import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransactionSchema } from '@/lib/validations';
import { createNotification } from '@/lib/notifications';
import { withErrorHandler, UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from '@/lib/errors';
import { logAction } from '@/lib/audit';

export const GET = withErrorHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const cursor = searchParams.get('cursor');
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null;
    const categoryId = searchParams.get('category');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const minAmount = searchParams.get('min');
    const maxAmount = searchParams.get('max');
    const sortBy = searchParams.get('sortBy') || 'transactionDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search');

    const where: any = {
        userId: session.user.id,
    };

    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
        where.transactionDate = {};
        if (startDate) where.transactionDate.gte = new Date(startDate);
        if (endDate) where.transactionDate.lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount) where.amount.gte = parseFloat(minAmount);
        if (maxAmount) where.amount.lte = parseFloat(maxAmount);
    }
    if (search) {
        where.description = { contains: search, mode: 'insensitive' };
    }

    const transactions = await prisma.transaction.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            transactionDate: true,
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            [sortBy]: sortOrder,
        },
    });

    const hasNextPage = transactions.length > limit;
    const items = hasNextPage ? transactions.slice(0, -1) : transactions;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return NextResponse.json({
        success: true,
        transactions: items,
        nextCursor,
    });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = TransactionSchema.safeParse(body);

    if (!validatedData.success) {
        throw new ValidationError(validatedData.error.issues[0].message);
    }

    const { categoryId, type } = validatedData.data;

    // Verify category exists and belongs to user and matches type
    const category = await prisma.category.findFirst({
        where: {
            id: categoryId,
            userId: session.user.id,
            type: type as any, // Cast because of different enum types in schema vs validation
        },
    });

    if (!category) {
        throw new ValidationError('Invalid category or category type mismatch');
    }

    const transaction = await prisma.transaction.create({
        data: {
            ...validatedData.data,
            userId: session.user.id,
        },
        include: {
            category: true,
        },
    });

    await logAction(session.user.id, 'TRANSACTION_CREATED', 'Transaction', {
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount)
    });

    // Trigger Notification if large transaction
    const prefs = await prisma.notificationPreference.findUnique({ where: { userId: session.user.id } });
    const limit = prefs?.largeTransactionLimit ? Number(prefs.largeTransactionLimit) : 1000;

    if (Number(transaction.amount) >= limit) {
        await createNotification(
            session.user.id,
            'LARGE_TRANSACTION',
            'Large Transaction Alert',
            `A ${transaction.type.toLowerCase()} of $${Number(transaction.amount).toFixed(2)} was recorded: ${transaction.description || 'No description'}.`,
            `/transactions?id=${transaction.id}`
        );
    }

    return NextResponse.json({
        success: true,
        data: transaction
    }, { status: 201 });
});
