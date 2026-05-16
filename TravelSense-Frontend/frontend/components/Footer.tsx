"use client";

import { Github, Twitter, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-20 pb-10 px-6 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
      <div className="container mx-auto pt-10 flex flex-col items-center">
        <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-5xl gap-8 mb-10">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              TravelSense
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
              Your intelligent companion for discovering the world, one location at a time.
            </p>
          </div>

          <div className="flex gap-4">
            {[
              { icon: <Github className="w-5 h-5" />, href: "#" },
              { icon: <Twitter className="w-5 h-5" />, href: "#" },
              { icon: <Linkedin className="w-5 h-5" />, href: "#" },
            ].map((social, i) => (
              <a 
                key={i} 
                href={social.href} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="w-full max-w-5xl pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 dark:text-slate-500 text-xs font-medium uppercase tracking-widest">
          <p>© {currentYear} TravelSense. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" /> by 
            <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"> Prince Kumar Yadav</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
