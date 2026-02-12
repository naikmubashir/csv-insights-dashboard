import { Activity } from "lucide-react";
import StatusCheck from "@/components/StatusCheck";

export default function StatusPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-7 h-7 text-blue-500" />
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            System Status
          </h1>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400">
          Health checks for backend, database, and LLM services
        </p>
      </div>

      <StatusCheck />
    </div>
  );
}
