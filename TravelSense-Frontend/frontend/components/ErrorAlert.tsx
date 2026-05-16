"use client";

import { AlertTriangle, Timer, Info } from "lucide-react";

interface ErrorAlertProps {
  message?: string;
  type?: "quota" | "server" | "generic";
  className?: string;
}

export default function ErrorAlert({ message, type = "generic", className = "" }: ErrorAlertProps) {
  const isQuota = type === "quota" || (message && (message.toLowerCase().includes("limit") || message.toLowerCase().includes("429")));
  const Icon = isQuota ? Timer : AlertTriangle;
  
  const displayMessage = message || (isQuota 
    ? "AI Service limit reached for today. Please try again in 1-2 minutes or tomorrow." 
    : "Service is currently busy. Please check your connection or try again later.");

  return (
    <div className={`flex items-center gap-4 p-5 rounded-[2rem] bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 animate-in fade-in slide-in-from-top-4 duration-500 ${className}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isQuota ? 'bg-amber-500 shadow-amber-500/20 text-white' : 'bg-rose-500 shadow-rose-500/20 text-white'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h3 className={`font-black text-sm uppercase tracking-wider mb-1 ${isQuota ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
          {isQuota ? "Limit Reached" : "Connection Error"}
        </h3>
        <p className="text-xs font-bold text-rose-600/70 dark:text-rose-400/60 leading-relaxed">
          {displayMessage}
        </p>
      </div>
    </div>
  );
}
