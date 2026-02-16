import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-utils';
import { RegisterSchema } from '@/lib/validations';
import { withErrorHandler, ValidationError, ConflictError } from '@/lib/errors';
import { logAction } from '@/lib/audit';
import { isRateLimited } from '@/lib/ratelimit';
import { TooManyRequestsError } from '@/lib/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { limited } = await isRateLimited(`register:${ip}`, 5, 15 * 60 * 1000); // 5 attempts per 15 min

    if (limited) {
        throw new TooManyRequestsError();
    }

    const body = await request.json();

    // Validate input using the comprehensive RegisterSchema
    const validationResult = RegisterSchema.safeParse(body);
    if (!validationResult.success) {
        throw new ValidationError(validationResult.error.issues[0].message);
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with transaction to ensure all related data is created
    const user = await prisma.$transaction(async (tx: any) => {
        // Create user
        const newUser = await tx.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        // Initialize notification preferences
        await tx.notificationPreference.create({
            data: {
                userId: newUser.id,
            }
        });

        // Create default Zakat settings
        await tx.zakatSettings.create({
            data: {
                userId: newUser.id,
                nisabAmount: 5000.0,
                zakatRate: 2.5,
                calculationMethod: 'AUTOMATIC',
            },
        });

        // Create default income categories
        const incomeCategories = [
            { name: 'Salary', isSystem: false },
            { name: 'Business Income', isSystem: false },
            { name: 'Investment Returns', isSystem: false },
            { name: 'Freelance', isSystem: false },
            { name: 'Gifts Received', isSystem: false },
            { name: 'Other Income', isSystem: false },
            { name: 'Uncategorized', isSystem: true },
        ];

        await tx.category.createMany({
            data: incomeCategories.map(cat => ({
                userId: newUser.id,
                name: cat.name,
                type: 'INCOME',
                isSystem: cat.isSystem,
            }))
        });

        // Create default expense categories
        const expenseCategories = [
            { name: 'Food & Dining', isSystem: false },
            { name: 'Transportation', isSystem: false },
            { name: 'Housing & Utilities', isSystem: false },
            { name: 'Shopping', isSystem: false },
            { name: 'Healthcare', isSystem: false },
            { name: 'Education', isSystem: false },
            { name: 'Entertainment', isSystem: false },
            { name: 'Subscriptions', isSystem: false },
            { name: 'Charity', isSystem: false },
            { name: 'Personal Care', isSystem: false },
            { name: 'Other Expenses', isSystem: false },
            { name: 'Uncategorized', isSystem: true },
        ];

        await tx.category.createMany({
            data: expenseCategories.map(cat => ({
                userId: newUser.id,
                name: cat.name,
                type: 'EXPENSE',
                isSystem: cat.isSystem,
            }))
        });

        return newUser;
    });

    await logAction(user.id, 'USER_REGISTERED', 'User', { email: user.email });

    return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
    }, { status: 201 });
});
