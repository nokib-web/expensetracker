import { prisma } from "./prisma";

type NotificationType = 'ZAKAT_DUE' | 'MONTHLY_SUMMARY' | 'LARGE_TRANSACTION' | 'BUDGET_WARNING' | 'PAYMENT_REMINDER' | 'INFO';

export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
) {
    try {
        // 1. Check user preferences
        const preferences = await prisma.notificationPreference.findUnique({
            where: { userId }
        });

        // If no preferences found, they might not have been initialized, proceed with default (true)
        let shouldNotify = true;

        if (preferences) {
            switch (type) {
                case 'ZAKAT_DUE': shouldNotify = preferences.zakatDueAlert; break;
                case 'MONTHLY_SUMMARY': shouldNotify = preferences.monthlySummaryAlert; break;
                case 'LARGE_TRANSACTION': shouldNotify = preferences.largeTransactionAlert; break;
                case 'BUDGET_WARNING': shouldNotify = preferences.budgetWarningAlert; break;
                case 'PAYMENT_REMINDER': shouldNotify = preferences.paymentReminderAlert; break;
            }
        }

        if (!shouldNotify) return null;

        // 2. Create the notification
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link
            }
        });

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        return null;
    }
}
