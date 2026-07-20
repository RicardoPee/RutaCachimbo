"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Send, Sparkles, Loader2, RefreshCw, GraduationCap, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deductPointsForTutor } from "@/actions/user-progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  league?: string;
  points?: number;
};

export const TutorChatClient = ({ league = "BRONCE", points = 0 }: Props) => {
  const [messages, setMessages] = useState<{ id: string, role: string, content: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
  };

  const submitMessage = async (text: string) => {
    const newMessages = [...messages, { id: Date.now().toString(), role: "user", content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        toast.error("Error al conectar con el Tutor IA.");
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      let assistantText = "";
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        let chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = assistantText;
          return updated;
        });
      }
    } catch (error: any) {
      toast.error("Hubo un corte en la conexión con el Tutor IA: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    submitMessage(prompt);
  };

  const handleAnalyzeMistakes = async () => {
    if (points < 20) {
      toast.error("Necesitas al menos 20 XP para este análisis Premium.");
      return;
    }
    const res = await deductPointsForTutor(20);
    if (res?.error) {
      toast.error(res.error);
      return;
    }
    toast.success("-20 XP: Análisis Neuronal Activado");
    submitMessage("Por favor, revisa mi historial de errores recientes que te he enviado en tu sistema. Dime en qué concepto estoy fallando más, y génerame 1 pregunta de opción múltiple (muy similar a las que he fallado) para ponerme a prueba ahora mismo.");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    submitMessage(inputValue);
    setInputValue("");
  };

  const isElite = league === "ORO" || league === "DIAMANTE";

  const quickPrompts = isElite ? [
    "Pídeme que resuelva una inferencia compleja con distractores.",
    "Debatamos sobre un texto filosófico de nivel San Marcos.",
    "Pon a prueba mi capacidad analítica con un caso contradictorio.",
  ] : [
    "¿Cómo identifico la idea principal en un texto?",
    "Dame un ejemplo sencillo de comprensión literal.",
    "Explícame qué significa 'inferir' con palabras fáciles.",
  ];

  const leagueStyles = isElite 
    ? "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]" 
    : "border-border bg-white dark:bg-background shadow-sm";

  const headerColors = isElite
    ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-b-0"
    : "bg-muted border-b-2 border-border";

  return (
    <div className={cn("flex flex-col h-[85vh] max-h-[85vh] w-full border-2 rounded-3xl overflow-hidden transition-all duration-500", leagueStyles)}>
      {/* Header */}
      <div className={cn("flex items-center justify-between px-6 py-4 transition-colors", headerColors)}>
        <div className="flex items-center gap-x-3">
          <div className="relative h-12 w-12 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/50 backdrop-blur-md">
            <Image
              src="/robot.svg"
              alt="AI Tutor"
              height={30}
              width={30}
              className="object-contain"
            />
            {isElite && <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-yellow-200 fill-yellow-200 animate-pulse" />}
          </div>
          <div>
            <h2 className={cn("text-lg font-black flex items-center gap-x-1", isElite ? "text-white" : "text-neutral-800 dark:text-white")}>
              {isElite ? "Mentor Élite Socrático" : "Tutor de IA Socrático"}
            </h2>
            <p className={cn("text-xs font-medium flex items-center gap-1", isElite ? "text-yellow-100" : "text-muted-foreground")}>
              <GraduationCap className="w-3 h-3" /> Nivel Adaptativo: Liga {league}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            onClick={handleClearChat}
            variant="ghost"
            size="sm"
            className={cn("text-xs transition-colors", isElite ? "text-white hover:bg-white/20" : "text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30")}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Reiniciar
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col min-h-0 bg-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className={cn("h-24 w-24 rounded-full flex items-center justify-center border-4 border-dashed animate-bounce", isElite ? "bg-yellow-100/50 border-yellow-400" : "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700")}>
              <Image src="/robot.svg" alt="Robot Mascot" height={60} width={60} />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-black text-neutral-800 dark:text-white">
                {isElite ? "¡Saludos, Mente Brillante!" : "¡Hola! Soy tu Tutor Virtual"}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {isElite 
                  ? "Veo que estás en la cima. Prepárate, no te daré las respuestas fáciles. Exigiré que tu análisis filosófico y crítico esté a la altura de tu Liga."
                  : "¿Tienes dudas sobre cómo analizar un texto o quieres repasar algún tipo de pregunta de examen? Estoy aquí para guiarte paso a paso."}
              </p>
            </div>
            
            <div className="flex flex-col gap-2 w-full max-w-md mt-4">
              <button
                onClick={handleAnalyzeMistakes}
                className="relative flex items-center gap-3 overflow-hidden text-sm text-left px-5 py-4 rounded-2xl border-2 transition-all font-black shadow-lg hover:-translate-y-1 hover:shadow-xl bg-gradient-to-r from-violet-600 to-indigo-600 border-indigo-400 text-white"
              >
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
                  <Zap className="h-5 w-5 text-yellow-300 fill-yellow-300" />
                </div>
                <div className="flex flex-col">
                  <span>Analizar mis peores errores</span>
                  <span className="text-xs text-indigo-200 font-medium">Costo: 20 XP (Tienes {points} XP)</span>
                </div>
              </button>

              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2" />

              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className={cn(
                    "text-xs text-left px-5 py-4 rounded-2xl border-2 transition-all font-bold shadow-sm hover:-translate-y-1",
                    isElite 
                      ? "border-yellow-200 dark:border-yellow-900 hover:border-yellow-500 bg-white/50 dark:bg-card/50 text-foreground" 
                      : "border-border hover:border-green-500 bg-card text-neutral-700 dark:text-neutral-300"
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message: any) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-x-3 max-w-[85%]",
                  isUser ? "self-end flex-row-reverse" : "self-start"
                )}
              >
                {!isUser && (
                  <div className={cn("h-10 w-10 border-2 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm", isElite ? "bg-yellow-50 border-yellow-400" : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800")}>
                    <Image src="/robot.svg" alt="AI Avatar" height={24} width={24} />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-[20px] px-5 py-3 text-[15px] leading-relaxed shadow-sm border-2",
                    isUser
                      ? "bg-neutral-800 border-neutral-900 text-white rounded-tr-none dark:bg-slate-200 dark:border-slate-300 dark:text-black font-medium"
                      : isElite 
                        ? "bg-card border-yellow-200 dark:border-yellow-900/50 text-foreground rounded-tl-none"
                        : "bg-card border-border text-foreground rounded-tl-none"
                  )}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="flex items-start gap-x-3 max-w-[80%] self-start animate-in fade-in duration-500">
            <div className={cn("h-10 w-10 border-2 rounded-full flex items-center justify-center flex-shrink-0 animate-spin", isElite ? "bg-yellow-50 border-yellow-400" : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800")}>
              <Loader2 className={cn("h-5 w-5", isElite ? "text-yellow-600" : "text-green-500")} />
            </div>
            <div className={cn("rounded-[20px] px-5 py-3 text-sm border-2 rounded-tl-none flex items-center shadow-sm", isElite ? "bg-card border-yellow-200 text-yellow-600 font-bold" : "bg-card border-border text-neutral-400")}>
              <span className="animate-pulse">Analizando tu lógica...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleFormSubmit}
        className={cn("p-4 border-t-2 flex items-center gap-x-3 transition-colors bg-white/50 dark:bg-background/50 backdrop-blur-md", isElite ? "border-yellow-200 dark:border-yellow-900/50" : "border-border")}
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isElite ? "Demuestra tu nivel argumentativo aquí..." : "Escribe tu duda o pregunta al tutor..."}
          className={cn("flex-1 rounded-2xl border-2 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors py-6 px-5 text-[15px]", isElite ? "focus:border-yellow-500" : "focus:border-green-500 dark:border-border dark:bg-card dark:text-white")}
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          size="icon"
          className={cn("h-12 w-12 rounded-2xl active:border-b-0 border-b-4 flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50", isElite ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-700 text-white" : "bg-green-500 hover:bg-green-600 border-green-700 text-white")}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};
