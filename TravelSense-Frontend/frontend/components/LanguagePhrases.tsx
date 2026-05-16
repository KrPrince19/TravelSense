"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Volume2, History, RefreshCw } from "lucide-react";
import { useLocation } from "@/hooks/useLocation";
import ErrorAlert from "./ErrorAlert";

const playAudio = (text: string, langName: string) => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Comprehensive language mapping
    const langMap: { [key: string]: string } = {
      "hindi": "hi-IN",
      "telugu": "te-IN",
      "tamil": "ta-IN",
      "kannada": "kn-IN",
      "malayalam": "ml-IN",
      "bengali": "bn-IN",
      "marathi": "mr-IN",
      "gujarati": "gu-IN",
      "punjabi": "pa-IN",
      "french": "fr-FR",
      "spanish": "es-ES",
      "german": "de-DE",
      "japanese": "ja-JP",
      "korean": "ko-KR",
      "chinese": "zh-CN"
    };

    const searchLang = langName.toLowerCase();
    const targetLangKey = Object.keys(langMap).find(key => searchLang.includes(key));
    const langCode = targetLangKey ? langMap[targetLangKey] : "en-US";
    
    utterance.lang = langCode;

    // Try to find a high-quality female voice
    const voices = window.speechSynthesis.getVoices();
    
    // Improved female voice detection
    const isFemale = (name: string) => {
      const femalePatterns = ["female", "woman", "girl", "zira", "heera", "sonia", "kalpana", "samantha", "victoria", "karen", "moira"];
      return femalePatterns.some(pattern => name.toLowerCase().includes(pattern));
    };

    const preferredVoice = voices.find(v => v.lang.startsWith(langCode) && isFemale(v.name)) || 
                          voices.find(v => v.lang.startsWith(langCode) && (v.name.includes("Google") || v.name.includes("Natural"))) ||
                          voices.find(v => v.lang.startsWith(langCode));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`[TTS] Selected: ${preferredVoice.name} | Language: ${langCode} | IsFemale: ${isFemale(preferredVoice.name)}`);
    } else {
      console.log(`[TTS] No specific voice found for ${langCode}, using system default.`);
    }

    // If the voice is likely male (or we can't be sure), use a higher pitch to feminize
    const voiceIsFemale = preferredVoice ? isFemale(preferredVoice.name) : false;
    utterance.pitch = voiceIsFemale ? 1.05 : 1.25; 
    utterance.rate = 0.95; // Slightly faster for more natural energy
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  }
};

interface Phrase {
  english: string;
  local: string;
}

interface LanguageData {
  language: string;
  phrases: Phrase[];
}

export default function LanguagePhrases() {
  const { locationDetails } = useLocation();
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"quota" | "server">("server");

  const fetchLanguages = async () => {
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

      if (!response.ok) throw new Error("Failed to fetch culture data");
      
      const data = await response.json();
      setLanguages(data.languages || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not load language phrases. Please try again later.");
      if (!err.message.includes("limit")) setErrorType("server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
  }, [locationDetails?.city, locationDetails?.state, locationDetails?.country]);

  if (!locationDetails?.city) return null;

  return (
    <div id="languages" className="w-full max-w-4xl mt-12 mb-12 text-left scroll-mt-20">
      <div className="group flex items-center justify-between mb-8 pl-1">
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 shadow-inner ring-1 ring-emerald-50 dark:ring-emerald-500/20 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 tracking-tight transform group-hover:translate-x-2 transition-transform duration-300">
            Language Phrases
          </h2>
        </div>
        {error && (
          <button 
            onClick={() => fetchLanguages()}
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
      ) : languages.length === 0 ? (
        <p className="text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">No language data found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map((langData, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden cursor-pointer">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4">{langData.language}</h3>
              <ul className="space-y-4">
                {langData.phrases.map((phrase, pIdx) => (
                  <li key={pIdx} className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0">
                    <span className="text-slate-600 dark:text-slate-400 text-sm w-1/3">{phrase.english}</span>
                    <div className="flex items-center gap-3 w-2/3 justify-end">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm text-right">{phrase.local}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); playAudio(phrase.local, langData.language); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
