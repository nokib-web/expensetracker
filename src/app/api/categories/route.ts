import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
    type: z.enum(['INCOME', 'EXPENSE']),
});

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null;
        const includeCount = searchParams.get('includeCount') === 'true';

        const where: any = {
            userId: session.user.id,
        };

        if (type) {
            where.type = type;
        }

        const categories = await prisma.category.findMany({
            where,
            include: includeCount ? {
                _count: {
                    select: { transactions: true }
                }
            } : undefined,
            orderBy: {
                name: 'asc',
            },
        });

        // Group by type if no type is specific
        if (!type) {
            const grouped = {
                INCOME: categories.filter((c: any) => c.type === 'INCOME'),
                EXPENSE: categories.filter((c: any) => c.type === 'EXPENSE'),
            };
            return NextResponse.json(grouped);
        }

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Categories GET error:', error);
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
        const validatedData = categorySchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
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
                type,
            },
        });

        if (existingCategory) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
        }

        const category = await prisma.category.create({
            data: {
                name,
                type,
                userId: session.user.id,
                isSystem: false,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Category POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
