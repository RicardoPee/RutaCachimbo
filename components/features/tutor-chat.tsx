"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Bot, User, X, MessageSquare, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type TutorChatProps = {
  question: string;
  selectedOption: string;
  correctOption: string;
  referenceText: string;
  onClose: () => void;
};

export const TutorChat = ({
  question,
  selectedOption,
  correctOption,
  referenceText,
  onClose,
}: TutorChatProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    messages: [
      {
        id: "welcome",
        role: "system",
        parts: [
          {
            type: "text",
            text: `Hola. Soy tu Coach de Comprensión Lectora. Veo que tuviste problemas con la pregunta: "${question}". Marcaste "${selectedOption}", pero la respuesta correcta es "${correctOption}". ¿Qué te parece si analizamos el texto juntos? Dime qué parte te causó confusión o qué entendiste de esa sección.`,
          }
        ]
      } as any,
    ],
  });

  const isLoading = status === "streaming";

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const textToSend = input;
    setInput("");
    await sendMessage({ text: textToSend });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-xl border-l-2 border-border shadow-2xl animate-in slide-in-from-right duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 px-6 border-b border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-sm text-foreground flex items-center gap-1">
              Tutor Socrático
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            </h4>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">En Línea</span>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-transparent"
      >
        {messages.map((m: any) => {
          const isSystem = m.role === "system";
          const isUser = m.role === "user";
          return (
            <div 
              key={m.id} 
              className={cn(
                "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                isUser 
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" 
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              )}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                isUser 
                  ? "bg-emerald-500 text-white rounded-tr-none font-medium" 
                  : "glass-card rounded-tl-none border-border text-foreground dark:text-slate-200"
              )}>
                {m.content || (m.parts && m.parts.map((p: any) => p.text).join(""))}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card p-4 rounded-2xl rounded-tl-none border-border text-muted-foreground flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleFormSubmit}
        className="p-4 border-t border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center gap-2"
      >
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu duda aquí..."
          disabled={isLoading}
          className="flex-1 bg-white/80 dark:bg-slate-800/80 border-2 border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()} 
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-3 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

    </div>
  );
};
