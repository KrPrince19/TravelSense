"use client";

import { useEffect, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import ErrorAlert from "./ErrorAlert";
import { Compass, Map, RefreshCw } from "lucide-react";

interface Place {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance: number;
}

export default function TouristPlaces() {
  const { coordinates } = useLocation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"quota" | "server">("server");

  const fetchPlaces = async () => {
    if (!coordinates.latitude || !coordinates.longitude) return;
    setLoading(true);
    setError(null);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(
        `${BACKEND_URL}/api/places?lat=${coordinates.latitude}&lng=${coordinates.longitude}`
      );
      
      if (response.status === 429) {
        setErrorType("quota");
        throw new Error("AI Service limit reached. Please try again in 1-2 minutes.");
      }

      if (!response.ok) throw new Error("Could not load tourist places. Please try again later.");
      
      const data = await response.json();
      setPlaces(data.places || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      if (!err.message.includes("limit")) setErrorType("server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [coordinates.latitude, coordinates.longitude]);

  if (!coordinates.latitude) return null;

  return (
    <div id="attractions" className="w-full max-w-4xl mt-12 text-left">
      <div className="group flex items-center justify-between mb-8 pl-1">
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 shadow-inner ring-1 ring-indigo-50 dark:ring-indigo-500/20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight transform group-hover:translate-x-2 transition-transform duration-300">
            Nearby Tourist Attractions
          </h2>
        </div>
        {error && (
          <button 
            onClick={() => fetchPlaces()}
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
      ) : places.length === 0 ? (
        <p className="text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">No tourist places found nearby.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <div key={place.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden cursor-pointer">
               <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 truncate">{place.name}</h3>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-4">{place.type}</p>
              
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm">
                <span>{place.distance} km away</span>
                <a 
                  href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lon}#map=16/${place.lat}/${place.lon}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                >
                  <Map className="w-4 h-4" />
                  View Map
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
