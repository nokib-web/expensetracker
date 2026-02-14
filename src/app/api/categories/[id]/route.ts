import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const validatedData = updateSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
        }

        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        if (category.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (category.isSystem) {
            return NextResponse.json({ error: 'System categories cannot be updated' }, { status: 400 });
        }

        const updatedCategory = await prisma.category.update({
            where: { id },
            data: {
                name: validatedData.data.name,
            },
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error('Category PUT error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        if (category.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (category.isSystem) {
            return NextResponse.json({ error: 'System categories cannot be deleted' }, { status: 400 });
        }

        // If category has transactions, we should reassign them to "Uncategorized"
        // Find the "Uncategorized" category for this user and type
        if (category._count.transactions > 0) {
            const uncategorized = await prisma.category.findFirst({
                where: {
                    userId: session.user.id,
                    type: category.type,
                    name: 'Uncategorized',
                }
            });

            if (!uncategorized) {
                return NextResponse.json({ error: 'Fallback category not found. Please contact support.' }, { status: 500 });
            }

            // Reassign transactions
            await prisma.transaction.updateMany({
                where: { categoryId: id },
                data: { categoryId: uncategorized.id }
            });
        }

        await prisma.category.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Category DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
