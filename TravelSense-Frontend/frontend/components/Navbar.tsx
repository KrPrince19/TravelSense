"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { Search, Menu, X, User } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  SignInButton, 
  SignUpButton, 
  useAuth
} from "@clerk/nextjs";

export default function Navbar() {
  const location = useLocation();
  const { searchLocation, coordinates } = location;
  const { isSignedIn, isLoaded } = useAuth();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchLocation(query);
      setQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm transition-all duration-300 dark:border-slate-800">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          href="/" 
          className="group relative font-extrabold text-2xl tracking-tighter"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:from-indigo-600 group-hover:to-blue-600 inline-block group-hover:scale-105">
            TravelSense
          </span>
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden lg:flex items-center">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search any city globally..." 
              className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all" 
            />
            <button type="submit" className="absolute right-3 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <div className="hidden lg:flex gap-8 text-sm font-medium text-slate-600">
            {/* AI Assistant CTA - Conditional Redirect */}
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all transform hover:-translate-y-0.5">
                  AI Assistant
                </button>
              </SignInButton>
            ) : (
              <Link 
                href="/assistant" 
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all transform hover:-translate-y-0.5"
              >
                AI Assistant
              </Link>
            )}

            {[
              { name: "Attractions", href: "/#attractions" },
              { name: "Restaurants", href: "/#restaurants" },
              { name: "Local Foods", href: "/#foods" },
              { name: "Culture", href: "/#languages" },
              { name: "Profile", href: "/profile", authOnly: true },
            ].map((link) => {
              if (link.authOnly && !isSignedIn) return null;
              return (
              <Link 
                key={link.name} 
                href={link.href} 
                className="relative py-1 group overflow-hidden"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400 text-sm font-medium text-slate-600">
                  {link.name}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
              </Link>
            );
          })}
          </div>

          <div className="hidden lg:flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6 ml-2">
            {!isLoaded ? (
              <div className="w-20 h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div>
            ) : !isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">
                    Log In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-lg active:scale-95 transition-all transform hover:-translate-y-0.5">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            ) : (
                <div className="flex items-center gap-4">
                  {/* Auth management moved to Profile page per user request */}
                </div>
            )}
          </div>

          <ThemeToggle />

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 z-50 overflow-hidden">
          <div className="flex flex-col p-6 gap-6">
            <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="relative w-full">
              <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search any city..." 
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-5 h-5" />
              </button>
            </form>

            <div className="flex flex-col gap-4">
              {/* Mobile AI Assistant CTA */}
              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-center shadow-lg">
                    AI Assistant
                  </button>
                </SignInButton>
              ) : (
                <Link 
                  href="/assistant"
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-center shadow-lg"
                >
                  AI Assistant
                </Link>
              )}

               {[
                 { name: "Attractions", href: "/#attractions" },
                 { name: "Restaurants", href: "/#restaurants" },
                 { name: "Local Foods", href: "/#foods" },
                 { name: "Language Support", href: "/#languages" },
                 { name: "My Profile", href: "/profile", authOnly: true },
              ].map((link) => {
                if (link.authOnly && !isSignedIn) return null;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-3 px-2 text-lg font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-slate-800/50"
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {!isLoaded ? (
                <div className="w-full h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl"></div>
              ) : !isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center">
                      Log In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-center shadow-lg">
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest leading-none">Authenticated</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
