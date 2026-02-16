import { z } from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain at least one uppercase letter, one number, and one special character"
        ),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const TransactionSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().positive("Amount must be positive").multipleOf(0.01, "Amount can have at most 2 decimal places")
    ),
    categoryId: z.string().uuid("Please select a valid category"),
    description: z.string().max(200, "Description must be less than 200 characters").optional(),
    transactionDate: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date().max(new Date(), "Transaction date cannot be in the future")
    ),
});

export const CategorySchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
    type: z.enum(["INCOME", "EXPENSE"]),
});

export const ZakatAssetSchema = z.object({
    source: z.enum(["CASH", "SAVINGS", "GOLD", "INVESTMENT"]),
    amount: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().positive("Amount must be positive").multipleOf(0.01, "Amount can have at most 2 decimal places")
    ),
    date: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date().max(new Date(), "Date cannot be in the future")
    ),
});

export const ZakatPaymentSchema = z.object({
    amountPaid: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().positive("Amount must be positive").multipleOf(0.01, "Amount can have at most 2 decimal places")
    ),
    paymentDate: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date().max(new Date(), "Payment date cannot be in the future")
    ),
    notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

export const ZakatSettingsSchema = z.object({
    nisabAmount: z.preprocess(
        (val) => (typeof val === "string" ? parseFloat(val) : val),
        z.number().positive("Nisab amount must be positive").multipleOf(0.01, "Amount can have at most 2 decimal places")
    ),
    zakatRate: z.number().min(0).max(100).default(2.5),
    calculationMethod: z.enum(["MANUAL", "AUTOMATIC"]),
});

export type RegisterValues = z.infer<typeof RegisterSchema>;
export type TransactionValues = z.infer<typeof TransactionSchema>;
export type CategoryValues = z.infer<typeof CategorySchema>;
export type ZakatAssetValues = z.infer<typeof ZakatAssetSchema>;
export type ZakatPaymentValues = z.infer<typeof ZakatPaymentSchema>;
export type ZakatSettingsValues = z.infer<typeof ZakatSettingsSchema>;
