"use client";

import { useEffect, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { Utensils, Star, Map, Route, RefreshCw } from "lucide-react";
import ErrorAlert from "./ErrorAlert";

interface RestaurantPlace {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance: number;
  cuisine?: string;
  rating?: string;
}

export default function Restaurants() {
  const { coordinates } = useLocation();
  const [restaurants, setRestaurants] = useState<RestaurantPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"quota" | "server">("server");

  const fetchRestaurants = async () => {
    if (!coordinates.latitude || !coordinates.longitude) return;
    setLoading(true);
    setError(null);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const response = await fetch(
        `${BACKEND_URL}/api/restaurants?lat=${coordinates.latitude}&lng=${coordinates.longitude}`
      );
      
      if (response.status === 429) {
        setErrorType("quota");
        throw new Error("AI Service limit reached. Please try again in 1-2 minutes.");
      }

      if (!response.ok) throw new Error("Could not load restaurants. Please try again later.");
      
      const data = await response.json();
      // Generate a mock rating if not provided by OSM
      const placesWithMockRatings = (data.restaurants || []).map((r: RestaurantPlace) => ({
        ...r,
        rating: r.rating || (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1)
      }));
      setRestaurants(placesWithMockRatings);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      if (!err.message.includes("limit")) setErrorType("server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [coordinates.latitude, coordinates.longitude]);

  if (!coordinates.latitude) return null;

  return (
    <div id="restaurants" className="w-full max-w-4xl mt-12 text-left">
      <div className="group flex items-center justify-between mb-8 pl-1">
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-100 dark:bg-orange-900/30 shadow-inner ring-1 ring-orange-50 dark:ring-orange-500/20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 tracking-tight transform group-hover:translate-x-2 transition-transform duration-300">
            Top Rated Restaurants
          </h2>
        </div>
        {error && (
          <button 
            onClick={() => fetchRestaurants()}
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
      ) : restaurants.length === 0 ? (
        <p className="text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">No restaurants found nearby.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((place) => (
            <div key={place.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden cursor-pointer">
               <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-orange-400 to-red-500 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg pr-4 truncate flex-1">{place.name}</h3>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2 py-1 flex-shrink-0">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-amber-700 dark:text-amber-400 text-xs font-bold">{place.rating}</span>
                </div>
              </div>
              
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium mb-1">{place.type}</p>
              {place.cuisine ? (
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-1">{place.cuisine}</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">Local Cuisine</p>
              )}
              
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-sm mt-auto pt-2 border-t border-slate-50 dark:border-slate-800">
                <span className="font-medium text-slate-600">{place.distance} km</span>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-orange-500 hover:text-orange-700 hover:underline focus:outline-none transition-colors"
                >
                  <Route className="w-4 h-4" />
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
