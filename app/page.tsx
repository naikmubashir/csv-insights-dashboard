import Link from "next/link";
import {
  Upload,
  BarChart3,
  History,
  Activity,
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  Database,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: FileSpreadsheet,
      title: "Upload CSV",
      description: "Drag & drop or browse to upload your CSV file. Preview data instantly.",
    },
    {
      icon: Sparkles,
      title: "AI Insights",
      description: "Get automated analysis powered by Gemini AI — trends, outliers, and recommendations.",
    },
    {
      icon: Database,
      title: "Save Reports",
      description: "Save your analysis reports and access them anytime from the history.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Data Analysis
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight">
          CSV Insights Dashboard
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
          Upload your CSV files and get instant AI-generated insights. Discover trends,
          spot outliers, and receive actionable recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload CSV
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <History className="w-4 h-4" />
            View History
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "Upload", desc: "Upload your CSV file" },
            { step: "2", title: "Preview", desc: "Review your data in a table" },
            { step: "3", title: "Analyze", desc: "AI generates insights" },
            { step: "4", title: "Save", desc: "Save and export your report" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-2 p-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                {item.step}
              </div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
              <p className="text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex justify-center gap-4 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/status"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <Activity className="w-4 h-4" />
          System Status
        </Link>
        <Link
          href="/history"
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
          Recent Reports
        </Link>
      </div>
    </div>
  );
}
