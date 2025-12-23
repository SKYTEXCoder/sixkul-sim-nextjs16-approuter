interface StatItem {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
}

interface StatSummaryProps {
  stats: StatItem[];
}

export function StatSummary({ stats }: StatSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {stat.label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stat.value}
            </span>
            {stat.subValue && (
              <span className="text-xs text-zinc-500">{stat.subValue}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
