import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

interface ReportCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ElementType;
}

export function ReportCard({
  title,
  description,
  href,
  icon: Icon = FileText,
}: ReportCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
          <Icon className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
        </div>
        <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transform group-hover:translate-x-1 transition-all" />
      </div>

      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
