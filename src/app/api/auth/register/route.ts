import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, validateEmail, validatePassword } from '@/lib/auth-utils';

// Validation schema
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validationResult = registerSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.issues[0].message },
                { status: 400 }
            );
        }

        const { name, email, password } = validationResult.data;

        // Additional validation
        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        if (!validatePassword(password)) {
            return NextResponse.json(
                {
                    error:
                        'Password must be at least 8 characters and contain at least one uppercase letter and one number',
                },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 400 }
            );
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
            for (const cat of incomeCategories) {
                await tx.category.create({
                    data: {
                        userId: newUser.id,
                        name: cat.name,
                        type: 'INCOME',
                        isSystem: cat.isSystem,
                    },
                });
            }

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
            for (const cat of expenseCategories) {
                await tx.category.create({
                    data: {
                        userId: newUser.id,
                        name: cat.name,
                        type: 'EXPENSE',
                        isSystem: cat.isSystem,
                    },
                });
            }


            return newUser;
        });

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'An error occurred during registration' },
            { status: 500 }
        );
    }
}
