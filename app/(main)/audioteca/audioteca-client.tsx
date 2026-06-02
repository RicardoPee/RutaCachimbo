"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack, 
  Headphones, 
  Clock, 
  Disc 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Track {
  id: string;
  title: string;
  description: string;
  duration: string;
  src: string;
  author: string;
  tag: string;
  image: string;
}

const tracks: Track[] = [
  {
    id: "1",
    title: "Comprensión Lectora Avanzada",
    description: "Técnicas de identificación de tesis y argumentos en textos complejos.",
    duration: "2:55",
    src: "/es_man.mp3",
    author: "Profesor Carlos (Voz Masculina)",
    tag: "Lectura Crítica",
    image: "/man.svg",
  },
  {
    id: "2",
    title: "Filosofía y Lectura Crítica",
    description: "Análisis de textos dialécticos y posturas opuestas de filósofos clásicos.",
    duration: "2:51",
    src: "/es_woman.mp3",
    author: "Profesora Laura (Voz Femenina)",
    tag: "Filosofía",
    image: "/woman.svg",
  },
  {
    id: "3",
    title: "Métodos de Análisis Crítico",
    description: "Desglose socrático de textos y detección de falacias comunes.",
    duration: "2:55",
    src: "/es_robot.mp3",
    author: "Tutor IA Cachimbo (Voz Robótica)",
    tag: "Métodos",
    image: "/robot.svg",
  },
  {
    id: "4",
    title: "Introducción al Texto Dialéctico",
    description: "Cómo contrastar la Tesis A y la Tesis B en preguntas de examen.",
    duration: "2:55",
    src: "/es_boy.mp3",
    author: "Estudiante Daniel (Voz Joven)",
    tag: "Comprensión",
    image: "/boy.svg",
  },
  {
    id: "5",
    title: "Métodos Científicos y Textos Académicos",
    description: "Guía de lectura para textos experimentales y razonamiento lógico.",
    duration: "2:51",
    src: "/es_girl.mp3",
    author: "Estudiante Valeria (Voz Joven)",
    tag: "Ciencias",
    image: "/girl.svg",
  },
  {
    id: "6",
    title: "Divertimento de Ejercicios",
    description: "Mini-lectura divertida para agilizar tu mente y descansar un poco.",
    duration: "2:43",
    src: "/es_zombie.mp3",
    author: "Zombincito Cachimbo (Voz Fantástica)",
    tag: "Divertido",
    image: "/zombie.svg",
  }
];

export const AudiotecaClient = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Reset play state and reload track when changing current track
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log("Play error: ", err));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => console.log("Play error: ", err));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnded = () => {
    handleNext();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    // Timeout to make sure browser resolves the DOM update before playing
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => console.log("Play error: ", err));
      }
    }, 50);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-[1056px] mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-8 flex items-center gap-x-3">
        <div className="h-12 w-12 bg-green-100 dark:bg-green-950 rounded-2xl flex items-center justify-center border-2 border-green-500">
          <Headphones className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-neutral-800 dark:text-white">Audioteca Cachimbo</h1>
          <p className="text-muted-foreground text-sm">Escucha las lecturas críticas y resúmenes guiados en formato de audio.</p>
        </div>
      </div>

      {/* Track List */}
      <div className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b-2 border-border bg-muted/50 flex justify-between items-center">
          <h3 className="text-sm font-black text-neutral-800 dark:text-white uppercase tracking-wider">Pistas de Estudio</h3>
          <span className="text-xs font-bold text-muted-foreground">{tracks.length} Audios Disponibles</span>
        </div>
        <div className="divide-y-2 divide-slate-100 dark:divide-slate-800/80">
          {tracks.map((track, index) => {
            const isActive = currentTrackIndex === index;
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                key={track.id}
                onClick={() => selectTrack(index)}
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group border-l-4 border-transparent",
                  isActive && "bg-green-50/30 dark:bg-green-950/20 border-green-500"
                )}
              >
                <div className="flex items-center gap-x-4 min-w-0 flex-1 mr-4">
                  {/* Number / Disc status */}
                  <div className="w-8 flex justify-center items-center">
                    {isActive && isPlaying ? (
                      <Disc className="h-5 w-5 text-green-500 animate-spin" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground group-hover:hidden">{index + 1}</span>
                    )}
                    <Play className="h-4 w-4 text-green-500 hidden group-hover:block shrink-0" />
                  </div>

                  {/* Thumbnail */}
                  <div className="h-12 w-12 bg-muted rounded-xl relative overflow-hidden flex-shrink-0 border border-border">
                    <Image 
                      src={track.image} 
                      alt={track.title} 
                      fill 
                      className="object-cover p-1"
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <h4 className={cn(
                      "text-sm font-bold truncate",
                      isActive ? "text-green-500" : "text-foreground"
                    )}>
                      {track.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate max-w-sm sm:max-w-md md:max-w-lg mt-0.5">
                      {track.description}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-x-6 text-xs text-muted-foreground font-bold flex-shrink-0">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-muted text-[10px]">
                    {track.tag}
                  </span>
                  <div className="flex items-center gap-x-1.5 w-16 justify-end">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{track.duration}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* HTML5 Audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
      />

      {/* Floating Spotify-style Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 text-white flex items-center justify-between px-6 sm:px-8 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-all duration-300">
        
        {/* Left: Current Track Details */}
        <div className="flex items-center gap-x-3 w-[30%] min-w-0">
          <div className="h-14 w-14 bg-slate-800 rounded-xl relative overflow-hidden flex-shrink-0 border border-slate-700">
            <Image 
              src={currentTrack.image} 
              alt={currentTrack.title} 
              fill 
              className="object-cover p-1"
            />
          </div>
          <div className="min-w-0 hidden md:block">
            <h5 className="text-sm font-bold truncate text-white">{currentTrack.title}</h5>
            <p className="text-xs text-slate-400 truncate mt-0.5">{currentTrack.author}</p>
          </div>
        </div>

        {/* Center: Controls & Seek */}
        <div className="flex flex-col items-center flex-1 max-w-lg">
          {/* Action buttons */}
          <div className="flex items-center gap-x-5">
            <button 
              onClick={handlePrev}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>
            <button 
              onClick={handlePlayPause}
              className="h-10 w-10 bg-white hover:scale-105 active:scale-95 text-black rounded-full flex items-center justify-center transition-all shadow-md"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current text-black" />
              ) : (
                <Play className="h-5 w-5 fill-current text-black ml-0.5" />
              )}
            </button>
            <button 
              onClick={handleNext}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
          </div>

          {/* Time & Progress Slider */}
          <div className="w-full flex items-center gap-x-3 text-[10px] sm:text-xs text-slate-400 font-bold mt-2">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 accent-green-500 bg-slate-700 rounded-lg appearance-none h-1 cursor-pointer outline-none transition-all hover:h-1.5"
            />
            <span className="w-8 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume Controls */}
        <div className="flex items-center justify-end gap-x-2.5 w-[30%]">
          <button 
            onClick={handleToggleMute}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-24 accent-green-500 bg-slate-700 rounded-lg appearance-none h-1 cursor-pointer outline-none transition-all hover:h-1.5"
          />
        </div>

      </div>
    </div>
  );
};
