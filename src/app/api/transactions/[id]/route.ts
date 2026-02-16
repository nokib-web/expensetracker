import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TransactionSchema } from '@/lib/validations';
import { withErrorHandler, UnauthorizedError, ValidationError, NotFoundError, ForbiddenError } from '@/lib/errors';

export const PUT = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = TransactionSchema.safeParse(body);

    if (!validatedData.success) {
        throw new ValidationError(validatedData.error.issues[0].message);
    }

    // Check ownership
    const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
    });

    if (!existingTransaction) {
        throw new NotFoundError('Transaction');
    }

    if (existingTransaction.userId !== session.user.id) {
        throw new ForbiddenError();
    }

    const { categoryId, type } = validatedData.data;

    // Verify category
    const category = await prisma.category.findFirst({
        where: {
            id: categoryId,
            userId: session.user.id,
            type: type as any,
        },
    });

    if (!category) {
        throw new ValidationError('Invalid category or category type mismatch');
    }

    const transaction = await prisma.transaction.update({
        where: { id },
        data: {
            ...validatedData.data,
        },
        include: {
            category: true,
        },
    });

    return NextResponse.json({
        success: true,
        data: transaction
    });
});

export const DELETE = withErrorHandler(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const { id } = await params;

    // Check ownership
    const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
    });

    if (!existingTransaction) {
        throw new NotFoundError('Transaction');
    }

    if (existingTransaction.userId !== session.user.id) {
        throw new ForbiddenError();
    }

    await prisma.transaction.delete({
        where: { id },
    });

    return NextResponse.json({
        success: true,
        message: 'Transaction deleted successfully'
    });
});
