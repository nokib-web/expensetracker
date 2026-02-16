import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface ZakatEligibilityBadgeProps {
    isEligible: boolean;
}

export function ZakatEligibilityBadge({ isEligible }: ZakatEligibilityBadgeProps) {
    return (
        <div className="flex items-center gap-2">
            <Badge variant={isEligible ? "success" : "default"} className="px-2 py-0.5">
                {isEligible ? "Eligible" : "Not Eligible"}
            </Badge>
            <div className="group relative">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {isEligible
                        ? "Your total eligible assets are above the Nisab threshold. Zakat is mandatory."
                        : "Your total eligible assets are below the Nisab threshold. Zakat is not mandatory."}
                </div>
            </div>
        </div>
    );
}
