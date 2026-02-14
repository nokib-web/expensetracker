import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create a demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@expensetracker.com' },
        update: {},
        create: {
            email: 'demo@expensetracker.com',
            name: 'Demo User',
            passwordHash: hashedPassword,
        },
    });

    console.log('✅ Created demo user:', demoUser.email);

    // Create default income categories
    const incomeCategories = [
        'Salary',
        'Business',
        'Investment',
        'Gift',
        'Other',
    ];

    for (const categoryName of incomeCategories) {
        await prisma.category.upsert({
            where: {
                id: `${demoUser.id}-income-${categoryName.toLowerCase()}`,
            },
            update: {},
            create: {
                id: `${demoUser.id}-income-${categoryName.toLowerCase()}`,
                userId: demoUser.id,
                name: categoryName,
                type: 'INCOME',
            },
        });
    }

    console.log('✅ Created income categories');

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
        await prisma.category.upsert({
            where: {
                id: `${demoUser.id}-expense-${categoryName.toLowerCase()}`,
            },
            update: {},
            create: {
                id: `${demoUser.id}-expense-${categoryName.toLowerCase()}`,
                userId: demoUser.id,
                name: categoryName,
                type: 'EXPENSE',
            },
        });
    }

    console.log('✅ Created expense categories');

    // Create default Zakat settings
    await prisma.zakatSettings.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
            userId: demoUser.id,
            nisabAmount: 5000.00, // Default nisab amount (can be updated by user)
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
