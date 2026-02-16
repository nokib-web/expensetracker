import { NextResponse } from "next/server";
import { isRateLimited } from "./ratelimit";
import { headers } from "next/headers";

export class AppError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error types
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string) {
        super(message, 500);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(message, 429);
    }
}



export function withErrorHandler(handler: Function) {
    return async (...args: any[]) => {
        try {
            // Apply global API rate limit (100 req per 15 min)
            const headersList = await headers();
            const ip = headersList.get('x-forwarded-for') || 'unknown';
            const { limited } = await isRateLimited(`api:${ip}`, 100, 15 * 60 * 1000);

            if (limited) {
                throw new TooManyRequestsError();
            }

            return await handler(...args);
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') {
                console.error('API Error:', error);
            }

            if (error instanceof AppError) {
                return NextResponse.json({
                    success: false,
                    error: error.name,
                    message: error.message
                }, { status: error.statusCode });
            }

            // Prisma errors
            if (error.code === 'P2002') {
                return NextResponse.json({
                    success: false,
                    error: 'ConflictError',
                    message: 'Resource already exists'
                }, { status: 409 });
            }

            if (error.code === 'P2025') {
                return NextResponse.json({
                    success: false,
                    error: 'NotFoundError',
                    message: 'Resource not found'
                }, { status: 404 });
            }

            // Generic error
            return NextResponse.json({
                success: false,
                error: 'InternalServerError',
                message: 'Internal server error'
            }, { status: 500 });
        }
    };
}
