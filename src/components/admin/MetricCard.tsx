import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  colorClass?: string;
  iconColorClass?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  colorClass = "bg-white dark:bg-slate-950",
  iconColorClass = "text-slate-500",
}: MetricCardProps) {
  return (
    <Card className={`${colorClass} border-slate-200 dark:border-slate-800`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </div>
        {(description || trend) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {trend && (
              <span
                className={trend.positive ? "text-emerald-500" : "text-red-500"}
              >
                {trend.positive ? "+" : ""}
                {trend.value}%{" "}
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
