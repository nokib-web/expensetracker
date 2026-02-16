import { cn } from "@/lib/utils";

interface ZakatProgressBarProps {
    paid: number;
    payable: number;
    className?: string;
}

export function ZakatProgressBar({ paid, payable, className }: ZakatProgressBarProps) {
    const percentage = payable > 0 ? Math.min((paid / payable) * 100, 100) : 0;

    // Color logic: Red (0-33), Yellow (34-66), Green (67-100)
    const getProgressColor = () => {
        if (percentage < 33) return "bg-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
        if (percentage < 67) return "bg-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
        return "bg-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]";
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex justify-between text-sm font-medium">
                <span>Payment Progress</span>
                <span>{percentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                <div
                    className={cn("h-full transition-all duration-1000 ease-out", getProgressColor())}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="text-[10px] text-muted-foreground text-right italic">
                {paid >= payable && payable > 0 ? "Purification complete" : `Remaining to purify: $${(payable - paid).toFixed(2)}`}
            </p>
        </div>
    );
}
