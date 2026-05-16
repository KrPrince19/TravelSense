"use client";

import { CloudRain, Sun, Cloud, Thermometer, Wind, Droplets, MapPin } from "lucide-react";

interface WeatherData {
  temp: string;
  condition: string;
  humidity: string;
  wind: string;
  city: string;
  isRainy: boolean;
}

export default function WeatherWidget({ weather }: { weather: WeatherData | null }) {
  if (!weather) return (
    <div className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 p-8 flex items-center justify-center animate-pulse">
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Weather...</p>
    </div>
  );

  const Icon = weather.isRainy ? CloudRain : weather.condition.toLowerCase().includes('cloud') ? Cloud : Sun;

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 p-8 shadow-2xl shadow-slate-200/20 dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl ${weather.isRainy ? 'bg-indigo-600 shadow-indigo-500/40' : 'bg-amber-500 shadow-amber-500/40'}`}>
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                {weather.temp}°
              </span>
              {weather.isRainy && (
                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-indigo-500/20">
                  RAIN ACTIVE
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">{weather.condition}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800/50 pt-6 sm:pt-0 sm:pl-8">
          <div className="flex flex-col items-center gap-1">
            <Droplets className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{weather.humidity}%</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Humid</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{weather.wind}</span>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Wind</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-3 h-3" /> {weather.city}
         </span>
         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Updated Just Now</span>
      </div>
    </div>
  );
}
