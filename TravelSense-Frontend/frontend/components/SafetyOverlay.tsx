"use client";

import { Shield, AlertTriangle, Heart, PhoneCall, Info, ShieldOff } from "lucide-react";

interface SafetyData {
  status: 'Safe' | 'Moderate' | 'Caution';
  safetyTip: string;
  healthAlert: string;
  emergency: string;
}

interface SafetyOverlayProps {
  data: SafetyData | null;
  isLoading?: boolean;
  error?: string | null;
}

export default function SafetyOverlay({ data, isLoading, error }: SafetyOverlayProps) {
  if (isLoading) {
    return (
      <div className="w-full p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 animate-pulse flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-4">
           <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
           <div className="space-y-2">
              <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
           </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-2">
           Syncing safety intelligence...
        </div>
      </div>
    );
  }

  if (error || (!data && !isLoading)) {
    return (
      <div className="w-full p-8 rounded-[2.5rem] bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/20 flex flex-col items-center justify-center text-center gap-4">
         <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
             <ShieldOff className="w-6 h-6" />
         </div>
         <div className="space-y-1">
            <h3 className="text-amber-900 dark:text-amber-400 font-black uppercase text-xs tracking-tight">Intelligence Offline</h3>
            <p className="text-amber-700/60 dark:text-amber-500/50 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
               {error || "Unable to reach real-time safety servers."}
            </p>
         </div>
      </div>
    );
  }

  const statusColors = {
    Safe: "bg-emerald-500 text-emerald-500 border-emerald-500/20 bg-emerald-500/10",
    Moderate: "bg-amber-500 text-amber-500 border-amber-500/20 bg-amber-500/10",
    Caution: "bg-red-500 text-red-500 border-red-500/20 bg-red-500/10"
  };

  const currentStatus = (data && data.status && statusColors[data.status]) ? data.status : "Safe";

  const statusBg = {
    Safe: "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60",
    Moderate: "bg-amber-50/30 dark:bg-amber-900/5 border-amber-200/40 dark:border-amber-900/20",
    Caution: "bg-red-50/30 dark:bg-red-900/5 border-red-200/40 dark:border-red-900/20"
  };

  return (
    <div className={`w-full p-8 rounded-[2.5rem] border ${statusBg[currentStatus]} shadow-2xl shadow-slate-200/20 dark:shadow-none transition-all duration-700 animate-in fade-in slide-in-from-right-4 flex flex-col justify-between`}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl ${statusColors[currentStatus].split(' ')[0]} flex items-center justify-center text-white shadow-lg`}>
              <Shield className="w-6 h-6" />
            </div>
            {data?.status !== "Safe" && (
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${statusColors[currentStatus].split(' ')[0]} animate-ping`}></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${statusColors[currentStatus].split(' ')[1]}`}>
                    {data?.status || "Safe"} ZONE
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">VERIFIED</span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mt-1">
                {currentStatus === "Safe" ? "Security: Clear" : "Security: Alert"}
            </h3>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${statusColors[currentStatus].split(' ')[1]} ${statusColors[currentStatus].split(' ')[2]} ${statusColors[currentStatus].split(' ')[3]}`}>
           {data?.status === "Safe" ? "Low Risk" : "Contextual"}
        </div>
      </div>

      <div className="space-y-3">
         <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-tight line-clamp-1">{data?.safetyTip || "Standard travel awareness"}</p>
         </div>
         
         <div className="flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-rose-50/50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20">
               <Heart className="w-3 h-3 text-rose-500" />
               <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase truncate max-w-[80px]">{data?.healthAlert || "Normal"}</span>
            </div>
            <a 
               href={`tel:${data?.emergency || "100"}`}
               className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
               <PhoneCall className="w-3 h-3 opacity-70" />
               <span className="text-[9px] font-black uppercase tracking-widest">{data?.emergency || "100"}</span>
            </a>
         </div>
      </div>
    </div>
  );
}
