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

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null;
        const categoryId = searchParams.get('categoryId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const search = searchParams.get('search');

        const skip = (page - 1) * limit;

        const where: any = {
            userId: session.user.id,
        };

        if (type) {
            where.type = type;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (startDate || endDate) {
            where.transactionDate = {};
            if (startDate) {
                where.transactionDate.gte = new Date(startDate);
            }
            if (endDate) {
                where.transactionDate.lte = new Date(endDate);
            }
        }

        if (search) {
            where.description = {
                contains: search,
                mode: 'insensitive',
            };
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: {
                    category: true,
                },
                orderBy: {
                    transactionDate: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        return NextResponse.json({
            transactions,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error('Transactions GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = transactionSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
        }

        const { categoryId, type } = validatedData.data;

        // Verify category exists and belongs to user and matches type
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

        const transaction = await prisma.transaction.create({
            data: {
                ...validatedData.data,
                userId: session.user.id,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Transaction POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
