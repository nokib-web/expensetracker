import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CategorySchema } from '@/lib/validations';
import { withErrorHandler, UnauthorizedError, ValidationError, ConflictError } from '@/lib/errors';

export const GET = withErrorHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null;
    const includeCount = searchParams.get('includeCount') === 'true';
    const includeTotals = searchParams.get('includeTotals') === 'true';

    const where: any = {
        userId: session.user.id,
    };

    if (type) where.type = type;

    const [categories, categoryStats] = await Promise.all([
        prisma.category.findMany({
            where,
            include: includeCount ? {
                _count: { select: { transactions: true } }
            } : undefined,
            orderBy: { name: 'asc' },
        }),
        includeTotals ? prisma.transaction.groupBy({
            by: ['categoryId'],
            where: { userId: session.user.id },
            _sum: { amount: true }
        }) : Promise.resolve([])
    ]);

    const categoriesWithStats = categories.map((cat: any) => {
        const stat = categoryStats.find((s: any) => s.categoryId === cat.id);
        return {
            ...cat,
            totalAmount: Number(stat?._sum.amount || 0)
        };
    });

    if (!type) {
        const grouped = {
            INCOME: categoriesWithStats.filter((c: any) => c.type === 'INCOME'),
            EXPENSE: categoriesWithStats.filter((c: any) => c.type === 'EXPENSE'),
        };
        return NextResponse.json({ success: true, ...grouped });
    }

    return NextResponse.json({ success: true, data: categoriesWithStats });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new UnauthorizedError();
    }

    const body = await request.json();
    const validatedData = CategorySchema.safeParse(body);

    if (!validatedData.success) {
        throw new ValidationError(validatedData.error.issues[0].message);
    }

    const { name, type } = validatedData.data;

    // Check for duplicates
    const existingCategory = await prisma.category.findFirst({
        where: {
            userId: session.user.id,
            name: {
                equals: name,
                mode: 'insensitive',
            },
            type: type as any,
        },
    });

    if (existingCategory) {
        throw new ConflictError('Category already exists');
    }

    const category = await prisma.category.create({
        data: {
            name,
            type: type as any,
            userId: session.user.id,
            isSystem: false,
        },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
});
