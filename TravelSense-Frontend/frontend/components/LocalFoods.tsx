"use client";

import { useEffect, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { Coffee, RefreshCw } from "lucide-react";
import ErrorAlert from "./ErrorAlert";

interface Food {
  name: string;
  description: string;
  image_url: string;
}

export default function LocalFoods() {
  const { locationDetails } = useLocation();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"quota" | "server">("server");

  const fetchFoods = async () => {
    if (!locationDetails?.city) return;
    setLoading(true);
    setError(null);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(
        `${BACKEND_URL}/api/culture?city=${encodeURIComponent(locationDetails.city)}&state=${encodeURIComponent(locationDetails.state)}&country=${encodeURIComponent(locationDetails.country)}`
      );
      
      if (response.status === 429) {
        setErrorType("quota");
        throw new Error("AI Service limit reached. Please try again in 1-2 minutes.");
      }

      if (!response.ok) throw new Error("Could not load local food data.");
      
      const data = await response.json();
      setFoods(data.famous_foods || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      if (!err.message.includes("limit")) setErrorType("server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [locationDetails?.city, locationDetails?.state, locationDetails?.country]);

  if (!locationDetails?.city) return null;

  return (
    <div id="foods" className="w-full max-w-4xl mt-12 text-left">
      <div className="group flex items-center justify-between mb-8 pl-1">
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 dark:bg-amber-900/30 shadow-inner ring-1 ring-amber-50 dark:ring-amber-500/20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 tracking-tight transform group-hover:translate-x-2 transition-transform duration-300">
            Local Delicacies & Sweets
          </h2>
        </div>
        {error && (
          <button 
            onClick={() => fetchFoods()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-white border border-slate-100 shadow-sm animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <ErrorAlert type={errorType} message={error} />
      ) : foods.length === 0 ? (
        <p className="text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">No local foods found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer">
              <div className="w-full h-48 overflow-hidden relative rounded-t-3xl">
                <img src={food.image_url} alt={food.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                <h3 className="absolute bottom-4 left-5 font-bold text-white text-xl pr-4 leading-tight">{food.name}</h3>
              </div>
              <div className="p-5 flex-grow bg-white dark:bg-slate-900">
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{food.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
