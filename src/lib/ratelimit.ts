type RateLimitRecord = {
    count: number;
    resetTime: number;
};

const cache = new Map<string, RateLimitRecord>();

export async function isRateLimited(
    key: string,
    limit: number,
    windowMs: number
): Promise<{ limited: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const record = cache.get(key);

    if (!record || now > record.resetTime) {
        const newRecord = {
            count: 1,
            resetTime: now + windowMs,
        };
        cache.set(key, newRecord);
        return { limited: false, remaining: limit - 1, reset: newRecord.resetTime };
    }

    if (record.count >= limit) {
        return { limited: true, remaining: 0, reset: record.resetTime };
    }

    record.count += 1;
    return { limited: false, remaining: limit - record.count, reset: record.resetTime };
}

// Cleanup interval to prevent memory leaks
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of cache.entries()) {
            if (now > record.resetTime) {
                cache.delete(key);
            }
        }
    }, 60000); // Clean every minute
}
