import { prisma } from "./prisma";
import { headers } from "next/headers";

export async function logAction(
    userId: string | null,
    action: string,
    resource?: string,
    details?: any
) {
    try {
        const headersList = await headers();
        const ipAddress = headersList.get("x-forwarded-for") || "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                details: details ? JSON.parse(JSON.stringify(details)) : undefined,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        console.error("Failed to log audit action:", error);
    }
}
