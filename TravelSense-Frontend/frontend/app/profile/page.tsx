"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { 
  User, 
  BookOpen, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  History, 
  Award,
  Loader2,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stats {
  stories: number;
  trips: number;
}

interface HistoryItem {
  _id: string;
  city?: string;
  destination?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<{ stories: HistoryItem[]; trips: HistoryItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoaded && user) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setStats(data.stats);
          setHistory(data.history);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch profile stats:", err);
          setLoading(false);
        });
    }
  }, [userLoaded, user]);

  if (!userLoaded || (loading && !stats)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 dark:border-slate-800">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Not Signed In</h1>
          <p className="text-slate-500 mb-6">Please sign in to view your travel profile and history.</p>
          <Link href="/" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Bar */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/5 mb-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <img 
                src={user.imageUrl} 
                alt={user.fullName || "User"} 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-800 shadow-2xl object-cover"
              />
              <div 
                className="absolute bottom-2 right-2 p-1.5 bg-white dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-800 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Account Settings"
              >
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarImage: { display: "none" },
                      userButtonAvatarBox: { 
                        width: "32px", 
                        height: "32px", 
                        backgroundImage: "url('https://api.iconify.design/lucide:user.svg?color=%234f46e5')", 
                        backgroundSize: "60%", 
                        backgroundPosition: "center", 
                        backgroundRepeat: "no-repeat",
                        backgroundColor: "#f8fafc"
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {user.fullName || user.username}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Pro Traveler
                </span>
                • {user.primaryEmailAddress?.emailAddress}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/30 transition-all group">
                <div className="text-3xl font-black text-blue-600 mb-1 group-hover:scale-110 transition-transform">{stats?.stories || 0}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Stories</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl text-center border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500/30 transition-all group">
                <div className="text-3xl font-black text-indigo-600 mb-1 group-hover:scale-110 transition-transform">{stats?.trips || 0}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Trips</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Stories Column */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">Travel Journal</h2>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Stories</div>
            </div>

            <div className="space-y-4">
              {history?.stories.length ? (
                history.stories.map((story) => (
                  <div key={story._id} className="group p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-500/20 transition-all cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{story.city}</h3>
                        <p className="text-xs text-slate-400">{new Date(story.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                   <p className="text-slate-400 text-sm">No stories written yet. Start your journey!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Trips Column */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <History className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold dark:text-white">Trip History</h2>
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed Plans</div>
            </div>

            <div className="space-y-4">
              {history?.trips.length ? (
                history.trips.map((trip) => (
                  <div key={trip._id} className="group p-4 rounded-2xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-500/20 transition-all cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 flex items-center justify-center text-indigo-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">{trip.destination}</h3>
                        <p className="text-xs text-slate-400">{new Date(trip.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                   <p className="text-slate-400 text-sm">No completed trips found. Plan your first adventure!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
