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
            const incomeCategories = ['Salary', 'Business', 'Investment', 'Gift', 'Other'];
            for (const categoryName of incomeCategories) {
                await tx.category.create({
                    data: {
                        userId: newUser.id,
                        name: categoryName,
                        type: 'INCOME',
                    },
                });
            }

            // Create default expense categories
            const expenseCategories = [
                'Food',
                'Transport',
                'Bills',
                'Shopping',
                'Healthcare',
                'Education',
                'Entertainment',
                'Other',
            ];
            for (const categoryName of expenseCategories) {
                await tx.category.create({
                    data: {
                        userId: newUser.id,
                        name: categoryName,
                        type: 'EXPENSE',
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
