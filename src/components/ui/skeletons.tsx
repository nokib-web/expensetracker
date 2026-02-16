import { Skeleton } from "./skeleton";
import { TableRow, TableCell } from "./table";

export function DashboardHeaderSkeleton() {
    return (
        <div className="space-y-2 mb-8">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64" />
        </div>
    );
}

export function StatsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-3xl bg-white shadow-xl shadow-slate-200/50 space-y-4">
                    <div className="flex justify-between items-start">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ChartSkeleton() {
    return (
        <div className="p-6 rounded-3xl bg-white shadow-xl shadow-slate-200/50 space-y-4 h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-end justify-between h-[250px] gap-4 pt-10">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                        key={i}
                        className="w-full rounded-t-xl"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

export function TransactionRowSkeleton() {
    return (
        <TableRow>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
            <TableCell><Skeleton className="h-8 w-20 mx-auto" /></TableCell>
        </TableRow>
    );
}
