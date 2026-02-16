import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const transactionSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().positive(),
    categoryId: z.string().uuid(),
    description: z.string().optional().nullable(),
    transactionDate: z.string().transform((str) => new Date(str)),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const validatedData = transactionSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
        }

        // Check ownership
        const existingTransaction = await prisma.transaction.findUnique({
            where: { id },
        });

        if (!existingTransaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (existingTransaction.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { categoryId, type } = validatedData.data;

        // Verify category
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId: session.user.id,
                type: type,
            },
        });

        if (!category) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
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

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Transaction PUT error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check ownership
        const existingTransaction = await prisma.transaction.findUnique({
            where: { id },
        });

        if (!existingTransaction) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (existingTransaction.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.transaction.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Transaction DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
