"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useLocation } from "@/hooks/useLocation";
import AssistantChat from "@/components/AssistantChat";
import ErrorAlert from "@/components/ErrorAlert";
import WeatherWidget from "@/components/WeatherWidget";
import SafetyOverlay from "@/components/SafetyOverlay";
import QuestCard from "@/components/QuestCard";
import StoryBook from "@/components/StoryBook";
import { 
  Calendar, Clock, MapPin, ChevronRight, Sparkles, 
  ArrowLeft, Trophy, BookMarked, Sparkle, Loader2,
  Compass, History, LayoutDashboard, AlertTriangle, CheckCircle2, Award,
  Search, X
} from "lucide-react";

const getWeatherCondition = (code: number) => {
  const mapping: Record<number, string> = {
    0: "Clear Sky",
    1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing Rime Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Slight Snowfall", 73: "Moderate Snowfall", 75: "Heavy Snowfall",
    80: "Slight Rain Showers", 81: "Moderate Rain Showers", 82: "Violent Rain Showers",
    95: "Thunderstorm", 96: "Thunderstorm with Slight Hail", 99: "Thunderstorm with Heavy Hail"
  };
  return mapping[code] || "Clear Sky";
};

export default function AssistantPage() {
  const { user } = useUser();
  const { locationDetails, coordinates, searchLocation, loading: locationLoading } = useLocation();
  const [itinerary, setItinerary] = useState<any>(null);
  const [triggerQuery, setTriggerQuery] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [safety, setSafety] = useState<any>(null);
  const [isSafetyLoading, setIsSafetyLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [tripSaved, setTripSaved] = useState(false);

  const cityName = locationDetails?.city || "Nellore";

  // Haversine Distance Formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  };

  useEffect(() => {
    const fetchQuests = async () => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        try {
            const res = await fetch(`${BACKEND_URL}/api/quests/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city: cityName, clerkId: user?.id })
            });
            console.log("QUEST API STATUS:", res.status, res.headers.get("content-type"));
            const data = await res.json();
            if (res.status === 429) {
                setIsLimitReached(true);
            }
            setQuests(Array.isArray(data) ? data : []);
        } catch (e) { 
            console.error("Quest fetch error", e);
            setIsLimitReached(true); // Treat as limit if it fails during high-load tests
        }
    };
    if (cityName) fetchQuests();
  }, [cityName]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fallback to Nellore coordinates if geolocation is not available yet
        const lat = coordinates.latitude || 14.4426; 
        const lon = coordinates.longitude || 79.9865;
        
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        const data = await res.json();
        const current = data.current;
        
        setWeather({
          temp: Math.round(current.temperature_2m).toString(),
          condition: getWeatherCondition(current.weather_code),
          humidity: current.relative_humidity_2m.toString(),
          wind: current.wind_speed_10m.toString(),
          city: cityName,
          isRainy: [61, 63, 65, 80, 81, 82, 95, 96, 99].includes(current.weather_code)
        });
      } catch (e) { console.error("Failed to fetch weather", e); }
    };
    if (cityName || coordinates.latitude) fetchWeather();
  }, [cityName, coordinates.latitude, coordinates.longitude]);

  useEffect(() => {
    const fetchStories = async () => {
        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
            const res = await fetch(`${BACKEND_URL}/api/stories?city=${cityName}&clerkId=${user?.id}`);
            if (res.status === 429) setIsLimitReached(true);
            const data = await res.json();
            setStories(Array.isArray(data) ? data : []);
        } catch (e) { console.error("Story fetch error", e); }
    };
    if (cityName) fetchStories();
  }, [cityName]);

  useEffect(() => {
    const fetchSafety = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        setIsSafetyLoading(true);
        setSafetyError(null);
        try {
            const query = new URLSearchParams({
              city: cityName,
              lat: (coordinates.latitude || 0).toString(),
              lon: (coordinates.longitude || 0).toString()
            });
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
            const res = await fetch(`${BACKEND_URL}/api/safety?${query}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            console.log("SAFETY API STATUS:", res.status, res.headers.get("content-type"));
            if (!res.ok) throw new Error("Safety timeout or error");
            
            const data = await res.json();
            setSafety(data);
        } catch (e: any) { 
            console.error("Safety fetch error", e);
            if (e.name === 'AbortError') {
                setSafetyError("Safety stats are taking too long to load. Try again later.");
            } else {
                setSafetyError("Unable to fetch real-time safety stats right now.");
            }
        } finally {
            setIsSafetyLoading(false);
        }
    };
    if (cityName) fetchSafety();
  }, [cityName, coordinates.latitude, coordinates.longitude]);

  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        const res = await fetch(`${BACKEND_URL}/api/stories/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city: cityName, itinerary, clerkId: user?.id })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            setStories(prev => [data, ...prev]);
        } else {
            console.error("Story generation failed:", data.error);
            // Optionally show an alert to the user here
        }
    } catch (e) { 
        console.error("Story generation network error", e); 
    } finally { 
        setIsGeneratingStory(false); 
    }
  };

  const handleGenerateClick = () => {
    setTriggerQuery(`Generate a comprehensive 3-day travel itinerary for ${cityName}.`);
  };

  const handleCompleteTrip = async () => {
    if (!itinerary || !user) return;
    setIsSavingTrip(true);
    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
        const res = await fetch(`${BACKEND_URL}/api/profile/trips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                destination: cityName, 
                planJSON: itinerary, 
                clerkId: user.id,
                isCompleted: true 
            })
        });
        if (res.ok) {
            setTripSaved(true);
            setTimeout(() => setTripSaved(false), 3000);
        }
    } catch (e) { console.error("Trip save error", e); }
    finally { setIsSavingTrip(false); }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Exit Dashboard</span>
              <span className="sm:hidden">Exit</span>
            </Link>
            
            <div className="hidden sm:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {cityName} <span className="text-indigo-600">Assistant</span>
                </h1>
                <div className="hidden xs:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">
                  LIVE
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden xs:block">Travel Intelligence Engine</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`w-4 h-4 ${isSearching ? "text-indigo-500 animate-pulse" : "text-slate-400 group-focus-within:text-indigo-500"} transition-colors`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setIsSearching(true);
                    await searchLocation(searchQuery);
                    setSearchQuery("");
                    setIsSearching(false);
                  }
                }}
                placeholder="Search any city (e.g. Bihar, Paris...)"
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800"
            >
              <Search className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
              {user?.firstName?.charAt(0) || "U"}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {showSearch && (
          <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top duration-300">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setIsSearching(true);
                    await searchLocation(searchQuery);
                    setSearchQuery("");
                    setIsSearching(false);
                    setShowSearch(false);
                  }
                }}
                placeholder="Enter city name..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <button 
                onClick={() => setShowSearch(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        
        {/* Dashboard Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Row 1: Real-time Intelligence (Weather & Safety) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
               <div className="h-full flex">
                 <WeatherWidget weather={weather} />
               </div>
               <div className="h-full flex">
                 <SafetyOverlay data={safety} isLoading={isSafetyLoading} error={safetyError} />
               </div>
            </div>

            {isLimitReached && <ErrorAlert type="quota" className="w-full" />}

            {/* Row 2: The Core Experience (Itinerary) */}
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col min-h-[600px]">
               {/* Itinerary Header */}
               <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Personalized Journey</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time Dynamic Planning</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {itinerary ? (
                      <button 
                         onClick={handleCompleteTrip}
                         disabled={isSavingTrip || tripSaved}
                         className={`flex-1 sm:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                             tripSaved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                         }`}
                      >
                        {isSavingTrip ? <Loader2 className="w-3 h-3 animate-spin" /> : tripSaved ? <CheckCircle2 className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                        {tripSaved ? "Archived" : "Complete Trip"}
                      </button>
                    ) : (
                      <button 
                         onClick={handleGenerateClick}
                         className="flex-1 sm:flex-none px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all active:scale-95 shadow-xl"
                      >
                        Generate 3-Day Plan
                      </button>
                    )}
                  </div>
               </div>

               {/* Itinerary Body */}
               <div className="flex-1 p-8 overflow-y-auto max-h-[800px] scrollbar-hide">
                  {!itinerary ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center px-6 animate-in fade-in zoom-in duration-700">
                      <div className="relative mb-8">
                        <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center animate-pulse">
                          <Compass className="w-10 h-10 text-indigo-300 dark:text-indigo-800" />
                        </div>
                        <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-indigo-500 animate-bounce" />
                      </div>
                      <div className="max-w-md mx-auto">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">Awaiting Your Command</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                          I'm ready to craft a personalized journey through {cityName}. 
                          Click generate above or chat with me to customize your adventure.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                           {["Culinary Tour 🍜", "Modern Art 🏛️", "Hidden Gems 💎"].map(tag => (
                             <span key={tag} className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               {tag}
                             </span>
                           ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {itinerary.days?.map((day: any) => (
                        <div key={day.day} className="relative pl-10 space-y-8 border-l-2 border-slate-100 dark:border-slate-800/50">
                          {/* Day Header Marker */}
                          <div className="absolute top-0 -left-[1.35rem] w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-base shadow-xl z-10">
                            {day.day}
                          </div>
                          
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Day {day.day} Overview</h2>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full uppercase tracking-widest">Active Plan</span>
                          </div>
                          
                          <div className="grid gap-4">
                            {day.activities.map((act: any, idx: number) => (
                              <div key={idx} className="group p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-xl">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{act.time}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{act.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{act.description}</p>
                                  </div>
                                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="w-4 h-4" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </section>

            {/* Row 3: Quests (Grid 3x1) */}
            <section className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">City Expeditions</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Earn rewards while exploring</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3 Active Quests</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {quests.length > 0 ? (
                    quests.map((q) => (
                      <QuestCard 
                        key={q._id} 
                        quest={q} 
                        distance={coordinates.latitude && coordinates.longitude ? getDistance(coordinates.latitude, coordinates.longitude, q.lat, q.lon) : null} 
                        onComplete={() => {
                          const fetchQuests = async () => {
                              const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
                              const res = await fetch(`${BACKEND_URL}/api/quests?city=${cityName}`);
                              const data = await res.json();
                              setQuests(Array.isArray(data) ? data : []);
                          };
                          fetchQuests();
                        }}
                      />
                    ))
                  ) : (
                    [1,2,3].map(i => (
                      <div key={i} className="h-[200px] rounded-3xl bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quest {i} Loading...</p>
                      </div>
                    ))
                  )}
               </div>
            </section>

          </div>

          {/* Right Sidebar: The Buddy (4 Cols) */}
          <aside className="lg:col-span-4 w-full lg:sticky lg:top-28 h-[600px] lg:h-[calc(100vh-160px)]">
             <div className="h-full relative">
                {/* Decorative Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative h-full">
                  <AssistantChat 
                    location={cityName}
                    coordinates={{ lat: coordinates.latitude, lon: coordinates.longitude }}
                    currentItinerary={itinerary}
                    onItineraryUpdate={setItinerary}
                    triggerQuery={triggerQuery}
                  />
                </div>
             </div>
          </aside>

        </div>

        {/* Full Width Footer Section: Stories */}
        <section className="mt-24 pt-16 border-t border-slate-200 dark:border-slate-900 space-y-12">
           <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start gap-4">
                   <div className="p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <BookMarked className="w-8 h-8" />
                   </div>
                   <div>
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Your Travelogue</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">AI-curated milestones of your adventure</p>
                   </div>
                </div>
              </div>
              <button 
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="group flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all active:scale-95 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white"
                >
                  {isGeneratingStory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkle className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                  Generate Daily Entry
                </button>
           </div>

           <div className="max-w-5xl mx-auto space-y-12 pb-24">
              {stories.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] flex flex-col items-center gap-4 bg-slate-50/30 dark:bg-slate-900/10">
                      <History className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                      <div className="space-y-1">
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">No Entries Found</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs">Keep exploring {cityName} to populate your diary.</p>
                      </div>
                  </div>
              ) : (
                  <div className="grid gap-12">
                    {stories.map((s, index) => (
                        <StoryBook key={s._id || `story-${index}`} story={s} />
                    ))}
                  </div>
              )}
           </div>
        </section>

      </div>
    </main>
  );
}
