"use client";

import { useState, useRef } from "react";
import { MapPin, CheckCircle2, Trophy, Navigation, Camera, Loader2, XCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface QuestProps {
  quest: {
    _id: string;
    title: string;
    riddle: string;
    isCompleted: boolean;
    points: number;
    lat: number;
    lon: number;
    city: string;
  };
  distance: number | null; // Distance in meters
  onComplete?: () => void;
}

export default function QuestCard({ quest, distance, onComplete }: QuestProps) {
  const { user } = useUser();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInRange = distance !== null && distance <= 50;

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        const res = await fetch(`${BACKEND_URL}/api/quests/${quest._id}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            imageBase64: base64String,
            city: quest.city,
            clerkId: user?.id
          })
        });
        
        const data = await res.json();
        
        if (data.success) {
          if (onComplete) onComplete();
        } else {
          setError(data.verification?.reason || "AI couldn't verify this landmark. Try a clearer shot!");
        }
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`relative p-8 rounded-[2rem] border transition-all duration-500 overflow-hidden group h-full flex flex-col justify-between ${
      quest.isCompleted 
        ? "bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-200/40 dark:border-emerald-800/50" 
        : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl hover:-translate-y-1"
    }`}>
      
      {/* Hidden Camera Input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleCapture}
        className="hidden" 
      />

      <div className="relative z-10">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
            quest.isCompleted 
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
              : "bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
          }`}>
            {quest.isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Navigation className="w-3 h-3" />}
            {quest.isCompleted ? "COMPLETED" : "EXPLORATION"}
          </div>
          <div className="flex items-center gap-1.5 text-amber-500 font-black text-xs">
            <Trophy className="w-4 h-4" />
            <span>{quest.points}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-8">
          <h3 className={`text-xl font-black tracking-tight leading-tight ${quest.isCompleted ? "text-slate-400" : "text-slate-900 dark:text-white"}`}>
            {quest.isCompleted ? quest.title : "Mystery Landmark"} 
          </h3>
          <p className={`text-xs leading-relaxed font-medium ${quest.isCompleted ? "text-slate-400/60" : "text-slate-500 dark:text-slate-400"}`}>
            {quest.riddle}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        {/* Error / Loading Feedback */}
        {isVerifying && (
          <div className="flex items-center gap-3 p-3 bg-indigo-600 rounded-xl mb-4 text-white animate-pulse shadow-lg shadow-indigo-500/20">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Vision Scanning...</span>
          </div>
        )}

        {error && !isVerifying && (
          <div className="flex items-center gap-2 p-3 bg-rose-500 rounded-xl mb-4 text-white shadow-lg shadow-rose-500/20">
              <XCircle className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-tight">{error}</span>
          </div>
        )}

        {/* Footer / Capture Button */}
        {!quest.isCompleted && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Proximity</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isInRange ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"}`}></div>
                <span className="text-[10px] font-black text-slate-900 dark:text-slate-200 uppercase">
                  {distance !== null ? `${Math.round(distance)}m` : "Detecting..."}
                </span>
              </div>
            </div>
            {isInRange && !isVerifying && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
            )}
          </div>
        )}
      </div>

      {/* Background Icon Decoration */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.05] dark:opacity-[0.08] pointer-events-none transform rotate-12 group-hover:scale-110 transition-transform duration-700 ${quest.isCompleted ? "text-emerald-500" : "text-slate-900 dark:text-white"}`}>
        <Trophy className="w-32 h-32" />
      </div>
    </div>
  );
}
