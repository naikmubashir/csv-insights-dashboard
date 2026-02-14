"use client";

import { InsightsResponse } from "@/types";
import { FileText, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { SafeHtml } from "@/components/SafeText";

interface InsightsDisplayProps {
  insights: InsightsResponse;
}

export default function InsightsDisplay({ insights }: InsightsDisplayProps) {
  const sections = [
    {
      title: "Summary",
      content: insights.summary,
      icon: FileText,
      color: "blue",
    },
    {
      title: "Trends",
      content: insights.trends,
      icon: TrendingUp,
      color: "green",
    },
    {
      title: "Outliers",
      content: insights.outliers,
      icon: AlertTriangle,
      color: "amber",
    },
    {
      title: "Recommendations",
      content: insights.recommendations,
      icon: Lightbulb,
      color: "purple",
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      icon: "text-blue-500",
      border: "border-blue-200 dark:border-blue-800",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/20",
      icon: "text-green-500",
      border: "border-green-200 dark:border-green-800",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/20",
      icon: "text-amber-500",
      border: "border-amber-200 dark:border-amber-800",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/20",
      icon: "text-purple-500",
      border: "border-purple-200 dark:border-purple-800",
    },
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const colors = colorClasses[section.color];
        const Icon = section.icon;
        return (
          <div
            key={section.title}
            className={`rounded-xl border p-6 ${colors.bg} ${colors.border}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon className={`w-5 h-5 ${colors.icon}`} />
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {section.title}
              </h3>
            </div>
            <SafeHtml
              text={section.content}
              className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
            />
          </div>
        );
      })}
    </div>
  );
}
