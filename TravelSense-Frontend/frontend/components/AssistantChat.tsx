"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MapPin, Loader2, Bot } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import ErrorAlert from "./ErrorAlert";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AssistantChatProps {
  location: string;
  coordinates: { lat: number | null; lon: number | null };
  currentItinerary: any;
  onItineraryUpdate: (newItinerary: any) => void;
  triggerQuery?: string | null;
}

export default function AssistantChat({ 
  location, 
  coordinates, 
  currentItinerary, 
  onItineraryUpdate,
  triggerQuery
}: AssistantChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hello ${user?.firstName || 'Explorer'}! I'm your AI Travel Buddy. I see you're in ${location || 'your current location'}. How can I help you with your journey today?` }
  ]);
  
  useEffect(() => {
    if (triggerQuery) {
        handleSend(triggerQuery);
    }
  }, [triggerQuery]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"quota" | "server">("server");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050';
      const res = await fetch(`${BACKEND_URL}/api/assistant/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          currentItinerary,
          location,
          coordinates,
          clerkId: user?.id
        })
      });

      if (res.status === 429) {
        setErrorType("quota");
        throw new Error("AI Service limit reached. Please try again in a minute.");
      }

      if (!res.ok) throw new Error("Server is currently busy. Please try again.");

      const data = await res.json();
      
      if (data.updatedItinerary) {
        onItineraryUpdate(data.updatedItinerary);
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      if (!err.message.includes("limit")) setErrorType("server");
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    { label: "Skip Next", action: "I'd like to skip the next activity." },
    { label: "Find Food", action: "I'm hungry! Find me a great local restaurant." },
    { label: "Local Tip", action: "Tell me a unique cultural tip for this city." }
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-5 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">Travel Buddy</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/20 uppercase tracking-widest">
          <MapPin className="w-3 h-3" />
          {location || "Detecting..."}
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white dark:bg-slate-900"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl shadow-sm ${
              msg.role === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none font-medium"
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-slate-800 px-5 py-3.5 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-0"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="px-2 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <ErrorAlert type={errorType} message={error} />
          </div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="p-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-10">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s.action)}
              className="flex-shrink-0 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-sm"
            >
              {s.label}
            </button>
          ))}
        </div>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your command..."
            className="w-full pl-5 pr-14 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm outline-none"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
