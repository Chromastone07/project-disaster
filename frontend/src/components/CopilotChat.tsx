import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, X, MessageSquare, Bot } from 'lucide-react';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the AI Assistant for C-SERP (Comprehensive System for Emergency Response and Planning).
Your role is to help users navigate the app, explain features, and guide them step-by-step through any process.

Here's an overview of the platform:
- It connects Citizens, Volunteers, and Authorities during disasters.
- Citizens can report incident emergencies, report civic issues (like potholes, waterlogging), and find assistance (shelters, medical, distribution points) on the Public Map.
- Citizens can become Volunteers. Volunteers can view a Task Queue of active incidents, apply for tasks, view field maps, check resource hubs, update task statuses, and update task progress bars.
- Authorities have a Command Center to view disaster reports, assign volunteers to tasks, manage inventory/resource registries, register bulk users via CSV, dispatch emergency broadcasts, view civic issues, and monitor system activity logs.
- The platform uses a Map-based system to track incidents and resources. We just added OSM integration to fetch nearby real-world amenities on the Public Map.
- Users can switch languages using the Google Translate dropdown located at the top right.

When a user asks how to do something, provide a clear, step-by-step guide indicating which page to go to and what to click. Keep responses concise but helpful.`;

export default function CopilotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: 'Hello! I am your C-SERP Companion. How can I help you use the platform today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Build conversation history format for gemini
      const contentHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${contentHistory}\nUser: ${userMessage}\nAssistant:`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'I could not generate a response.' }]);
    } catch (err: any) {
      console.error("Chat error", err);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting to my servers right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[600] w-14 h-14 bg-rose-600 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-rose-700 transition-all ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 z-[600] w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col transition-all origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        {/* Header */}
        <div className="h-14 bg-slate-900 rounded-t-xl flex items-center justify-between px-4 text-white">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-rose-400" />
            <h3 className="font-bold">C-SERP Companion</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-rose-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                {msg.role === 'user' ? msg.text : (
                  <div className="markdown-body">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-white border border-slate-200 rounded-lg p-3 rounded-tl-none shadow-sm flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white rounded-b-xl flex gap-2">
          <input 
            type="text" 
            placeholder="Ask me anything about C-SERP..." 
            className="flex-1 bg-slate-100 border-none rounded-lg px-3 text-sm focus:ring-1 focus:ring-rose-500 outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white hover:bg-slate-800 disabled:opacity-50 transition"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
