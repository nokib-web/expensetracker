import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Default categories that are auto-created for each new user
const DEFAULT_INCOME_CATEGORIES = [
    { name: 'Salary', isSystem: false },
    { name: 'Business Income', isSystem: false },
    { name: 'Investment Returns', isSystem: false },
    { name: 'Freelance', isSystem: false },
    { name: 'Gifts Received', isSystem: false },
    { name: 'Other Income', isSystem: false },
    { name: 'Uncategorized', isSystem: true },
];

const DEFAULT_EXPENSE_CATEGORIES = [
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

async function createDefaultCategories(userId: string) {
    // Create income categories
    for (const cat of DEFAULT_INCOME_CATEGORIES) {
        const existing = await prisma.category.findFirst({
            where: {
                userId,
                name: cat.name,
                type: 'INCOME',
            },
        });
        if (!existing) {
            await prisma.category.create({
                data: {
                    userId,
                    name: cat.name,
                    type: 'INCOME',
                    isSystem: cat.isSystem,
                },
            });
        }
    }

    // Create expense categories
    for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
        const existing = await prisma.category.findFirst({
            where: {
                userId,
                name: cat.name,
                type: 'EXPENSE',
            },
        });
        if (!existing) {
            await prisma.category.create({
                data: {
                    userId,
                    name: cat.name,
                    type: 'EXPENSE',
                    isSystem: cat.isSystem,
                },
            });
        }
    }
}

async function main() {
    console.log('🌱 Starting database seed...');

    // Create a demo user
    const password = 'Demo1234';
    const hashedPassword = await bcrypt.hash(password, 10);

    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@expensetracker.com' },
        update: {
            passwordHash: hashedPassword,
        },
        create: {
            email: 'demo@expensetracker.com',
            name: 'Demo User',
            passwordHash: hashedPassword,
        },
    });

    console.log('✅ Created/Updated demo user:', demoUser.email);
    console.log('🔑 Demo Password:', password);

    // Create default categories for demo user
    await createDefaultCategories(demoUser.id);
    console.log('✅ Created default income categories');
    console.log('✅ Created default expense categories');

    // Create default Zakat settings
    await prisma.zakatSettings.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
            userId: demoUser.id,
            nisabAmount: 5000.00,
            zakatRate: 2.5,
            calculationMethod: 'AUTOMATIC',
        },
    });

    console.log('✅ Created default Zakat settings');
    console.log('🎉 Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
