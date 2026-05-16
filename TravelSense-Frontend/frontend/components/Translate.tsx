"use client";

import { useState, useEffect } from "react";
import { Languages, Send, Volume2, Copy, Check, RefreshCw } from "lucide-react";
import ErrorAlert from "./ErrorAlert";

// Reuse and adapt the playAudio logic from LanguagePhrases
const playAudio = (text: string, langName: string) => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap: { [key: string]: string } = {
      "hindi": "hi-IN", "telugu": "te-IN", "tamil": "ta-IN", "kannada": "kn-IN",
      "malayalam": "ml-IN", "bengali": "bn-IN", "marathi": "mr-IN", "gujarati": "gu-IN",
      "punjabi": "pa-IN", "french": "fr-FR", "spanish": "es-ES", "german": "de-DE",
      "japanese": "ja-JP", "korean": "ko-KR", "chinese": "zh-CN", "english": "en-US"
    };

    const searchLang = langName.toLowerCase();
    const targetLangKey = Object.keys(langMap).find(key => searchLang.includes(key));
    const langCode = targetLangKey ? langMap[targetLangKey] : "en-US";
    utterance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const isFemale = (name: string) => {
      const patterns = ["female", "woman", "girl", "zira", "heera", "sonia", "kalpana", "samantha", "victoria", "karen", "moira"];
      return patterns.some(p => name.toLowerCase().includes(p));
    };

    const preferredVoice = voices.find(v => v.lang.startsWith(langCode) && isFemale(v.name)) || 
                          voices.find(v => v.lang.startsWith(langCode) && (v.name.includes("Google") || v.name.includes("Natural"))) ||
                          voices.find(v => v.lang.startsWith(langCode));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`[Translate TTS] Selected: ${preferredVoice.name} | Language: ${langCode} | IsFemale: ${isFemale(preferredVoice.name)}`);
    } else {
      console.log(`[Translate TTS] No specific voice found for ${langCode}, using system default.`);
    }

    const voiceIsFemale = preferredVoice ? isFemale(preferredVoice.name) : false;
    utterance.pitch = voiceIsFemale ? 1.05 : 1.25; 
    utterance.rate = 0.95; // Slightly faster for more natural energy
    utterance.volume = 1.0; // Max volume
    window.speechSynthesis.speak(utterance);
  }
};

const languages = [
  { name: "Hindi", code: "hi" }, { name: "Telugu", code: "te" }, 
  { name: "Tamil", code: "ta" }, { name: "Kannada", code: "kn" },
  { name: "English", code: "en" }, { name: "French", code: "fr" },
  { name: "Spanish", code: "es" }, { name: "German", code: "de" },
  { name: "Japanese", code: "ja" }, { name: "Korean", code: "ko" }
];

export default function Translate() {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"quota" | "server">("server");

  useEffect(() => {
    // Preload voices
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const res = await fetch(`${BACKEND_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: targetLang })
      });

      if (res.status === 429) {
        setErrorType("quota");
        throw new Error("AI Service limit reached. Please try again in 1-2 minutes.");
      }

      if (!res.ok) throw new Error("Translation service is currently busy.");

      const data = await res.json();
      setTranslatedText(data.translated);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      if (!err.message.includes("limit")) setErrorType("server");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="translate" className="w-full max-w-4xl mt-12 mb-12 scroll-mt-20 px-1">
      <div className="group flex items-center gap-4 mb-8 pl-1">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 shadow-inner ring-1 ring-indigo-50 dark:ring-indigo-500/20 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
          <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 tracking-tight transform group-hover:translate-x-2 transition-transform duration-300">
          AI Translator
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Side */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl relative group overflow-hidden">
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 ml-1">Your Message</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type anything to translate..."
            className="w-full h-32 sm:h-40 bg-transparent text-slate-800 dark:text-white text-lg font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none resize-none"
          />
          <div className="flex justify-between items-center mt-4">
             <div className="hidden sm:block text-xs text-slate-400">Powered by Gemini AI</div>
             <button 
               onClick={handleTranslate}
               disabled={loading || !text.trim()}
               className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-sm"
             >
               {loading ? "Translating..." : "Translate"}
               <Send className="w-4 h-4" />
             </button>
          </div>
        </div>

        {/* Output Side */}
        <div className="bg-gradient-to-br from-indigo-600/5 to-purple-600/5 dark:from-indigo-500/10 dark:to-purple-500/10 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-indigo-100/30 dark:border-indigo-500/20 shadow-xl relative group flex flex-col min-h-[14rem] sm:min-h-[16rem]">
          <div className="flex justify-between items-center mb-4">
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 focus:outline-none"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.name}>{lang.name}</option>
              ))}
            </select>
            
            {translatedText && (
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => playAudio(translatedText, targetLang)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col items-center justify-center gap-4">
            {error ? (
              <ErrorAlert type={errorType} message={error} className="w-full" />
            ) : translatedText ? (
              <p className="text-xl font-semibold text-slate-900 dark:text-white leading-relaxed text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                {translatedText}
              </p>
            ) : (
              <p className="text-slate-300 dark:text-slate-800 italic text-center px-4">
                Translation will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
