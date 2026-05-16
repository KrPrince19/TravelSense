"use client";

import { useLocation } from "@/hooks/useLocation";
import { MapPin } from "lucide-react";

export default function LocationCard() {
  const { coordinates, locationDetails, loading, error, refreshLocation } = useLocation();

  return (
    <div className="w-full max-w-lg p-8 rounded-3xl border border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xl hover:shadow-2xl dark:shadow-indigo-500/10 transition-shadow duration-300 text-center relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      
      <p className="flex items-center justify-center gap-2 text-indigo-600 text-xs uppercase tracking-[0.2em] font-bold mb-4">
        <MapPin className="w-4 h-4" />
        Current Location
      </p>
      {loading ? (
        <div className="space-y-3 py-4">
          <div className="h-5 w-3/4 bg-slate-100 animate-pulse rounded-md mx-auto"></div>
          <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded-md mx-auto"></div>
        </div>
      ) : error ? (
        <div className="space-y-4 py-2 flex flex-col items-center">
          <p className="text-rose-600 text-sm font-medium bg-rose-50 py-3 px-5 rounded-2xl inline-block border border-rose-100 max-w-[90%] break-words">
            {error}
          </p>
          <button 
            onClick={() => refreshLocation()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white break-words w-full px-4">
            {locationDetails ? `${locationDetails.city}` : "Location Detected"}
          </p>
          {locationDetails && (
            <p className="text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 text-sm mt-3">
              {locationDetails.state}, <span className="text-slate-700 dark:text-slate-200 font-semibold">{locationDetails.country}</span>
            </p>
          )}
          {!locationDetails && (
            <p className="text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 text-sm mt-3">
              Lat: <span className="text-slate-700 dark:text-slate-200 font-semibold">{coordinates.latitude?.toFixed(4)}</span> • 
              Lon: <span className="text-slate-700 dark:text-slate-200 font-semibold">{coordinates.longitude?.toFixed(4)}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
