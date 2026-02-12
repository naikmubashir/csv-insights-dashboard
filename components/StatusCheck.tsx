"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { HealthStatus } from "@/types";

export default function StatusCheck() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        setStatus(data);
      } catch {
        setStatus({
          status: "unhealthy",
          database: { connected: false, message: "Failed to reach status endpoint" },
          llm: { connected: false, message: "Failed to reach status endpoint" },
          timestamp: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!status) return null;

  const checks = [
    {
      name: "Backend Server",
      connected: true,
      message: "Next.js server is running",
    },
    {
      name: "Database (PostgreSQL)",
      connected: status.database.connected,
      message: status.database.message,
    },
    {
      name: "LLM (Gemini API)",
      connected: status.llm.connected,
      message: status.llm.message,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-3 h-3 rounded-full ${
            status.status === "healthy" ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-zinc-500">
          Overall: {status.status === "healthy" ? "All systems operational" : "Some issues detected"}
        </span>
      </div>

      {checks.map((check) => (
        <div
          key={check.name}
          className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <div className="flex items-center gap-3">
            {check.connected ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{check.name}</p>
              <p className="text-sm text-zinc-500">{check.message}</p>
            </div>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              check.connected
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {check.connected ? "Connected" : "Error"}
          </span>
        </div>
      ))}

      <p className="text-xs text-zinc-400 text-right mt-2">
        Last checked: {new Date(status.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}
