"use client";

import { BookOpen, Share2, Calendar, Star, Quote } from "lucide-react";

interface Story {
  _id: string;
  city: string;
  narrative: string;
  questCount: number;
  createdAt: string;
}

export default function StoryBook({ story }: { story: Story }) {
  const date = new Date(story.createdAt).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="relative group w-full max-w-5xl mx-auto">
      {/* Decorative Scrapbook Elements */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-[100px] group-hover:bg-purple-500/20 transition-all duration-1000"></div>

      <div className="relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem] p-8 sm:p-16 shadow-2xl overflow-hidden shadow-slate-200/40 dark:shadow-none">
        
        {/* Abstract Pattern Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-bl-[100px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
                {date}
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Exploring <span className="text-indigo-600 dark:text-indigo-500">{story.city}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Achievements</span>
                <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < story.questCount ? "text-amber-500 fill-amber-500" : "text-slate-200 dark:text-slate-700"}`} />
                    ))}
                </div>
             </div>
             <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700"></div>
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Entry</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">#{story._id.slice(-4)}</span>
             </div>
          </div>
        </div>

        {/* Narrative Content */}
        <div className="relative">
          <Quote className="absolute -top-12 -left-8 w-24 h-24 text-slate-50 dark:text-slate-800/30 pointer-events-none -z-0" />
          <div className="relative z-10 space-y-8">
            {story.narrative.split('\n\n').map((para, i) => (
              <p 
                key={i} 
                className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed md:leading-[1.9] text-justify"
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <BookOpen className="w-4 h-4" />
                Chronicle Signature Detected
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
               <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95">
                  <Share2 className="w-4 h-4" />
                  Share
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}
