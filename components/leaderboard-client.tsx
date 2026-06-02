"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Target } from "lucide-react";
import { UserProfileDialog } from "./user-profile-dialog";

type LeaderboardClientProps = {
  allTimeData: any[];
  weeklyData: any[];
  currentUserId: string;
};

export const LeaderboardClient = ({ allTimeData, weeklyData, currentUserId }: LeaderboardClientProps) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const getBorderStyles = (borderName?: string) => {
    if (borderName === "fire") return "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] dark:bg-rose-950 bg-rose-50";
    if (borderName === "ice") return "border-cyan-500 shadow-[0_0_15px_rgba(6,182,214,0.8)] dark:bg-cyan-950 bg-cyan-50";
    if (borderName === "gold") return "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)] dark:bg-yellow-950 bg-yellow-50";
    return "border-slate-300 dark:border-slate-600 bg-muted";
  };

  const renderPodium = (data: any[]) => {
    const top3 = data.slice(0, 3);
    if (top3.length === 0) return null;

    // Podio visual
    return (
      <div className="flex justify-center items-end gap-4 mb-8 mt-4">
        {/* Puesto 2 */}
        {top3[1] && (
          <div onClick={() => setSelectedUser(top3[1])} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
            <div className="relative">
              <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-slate-400 w-8 h-8" />
              <Avatar className={`h-16 w-16 border-4 ${getBorderStyles(top3[1].activeBorder)}`}>
                <AvatarImage src={top3[1].userImageSrc} className="object-cover" />
              </Avatar>
            </div>
            <p className="font-bold text-neutral-700 dark:text-white mt-2 truncate w-20 text-center">{top3[1].userName}</p>
            <div className="bg-slate-300 text-slate-800 font-bold px-3 py-1 rounded-t-lg mt-2 h-16 flex items-center justify-center w-16">
              2
            </div>
          </div>
        )}

        {/* Puesto 1 */}
        {top3[0] && (
          <div onClick={() => setSelectedUser(top3[0])} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform z-10">
            <div className="relative">
              <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 w-10 h-10" />
              <Avatar className={`h-20 w-20 border-4 ${getBorderStyles(top3[0].activeBorder || 'gold')}`}>
                <AvatarImage src={top3[0].userImageSrc} className="object-cover" />
              </Avatar>
            </div>
            <p className="font-bold text-neutral-800 dark:text-white mt-2 truncate w-24 text-center">{top3[0].userName}</p>
            <div className="bg-yellow-400 text-yellow-900 font-black px-4 py-1 rounded-t-lg mt-2 h-24 flex items-center justify-center w-20 text-xl">
              1
            </div>
          </div>
        )}

        {/* Puesto 3 */}
        {top3[2] && (
          <div onClick={() => setSelectedUser(top3[2])} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
            <div className="relative">
              <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-700 w-8 h-8" />
              <Avatar className={`h-16 w-16 border-4 ${getBorderStyles(top3[2].activeBorder)}`}>
                <AvatarImage src={top3[2].userImageSrc} className="object-cover" />
              </Avatar>
            </div>
            <p className="font-bold text-neutral-700 dark:text-white mt-2 truncate w-20 text-center">{top3[2].userName}</p>
            <div className="bg-amber-700 text-amber-100 font-bold px-3 py-1 rounded-t-lg mt-2 h-12 flex items-center justify-center w-16">
              3
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderList = (data: any[], isWeekly: boolean) => {
    const others = data.slice(3);
    const myIndex = data.findIndex(u => u.userId === currentUserId);
    const rival = myIndex > 3 ? data[myIndex - 1] : null;

    return (
      <div className="w-full flex flex-col items-center">
        {renderPodium(data)}
        
        {/* Si el rival existe, mostrar un banner motivacional */}
        {rival && (
          <div className="w-full bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 p-3 rounded-xl flex items-center justify-between mb-4">
            <div className="flex items-center gap-x-2 text-rose-600 dark:text-rose-400">
              <Target className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm">Rival a Vencer:</span>
            </div>
            <span className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              ¡Estás a {(isWeekly ? rival.weeklyPoints : rival.points) - (isWeekly ? data[myIndex].weeklyPoints : data[myIndex].points) + 1} XP de superar a {rival.userName}!
            </span>
          </div>
        )}

        <Separator className="mb-4 h-0.5 rounded-full dark:bg-slate-800" />
        
        {others.map((userProgress, index) => {
          const actualRank = index + 4; // Top 3 are sliced out
          const isMe = userProgress.userId === currentUserId;
          const isRival = rival?.userId === userProgress.userId;

          return (
            <div 
              key={userProgress.userId}
              onClick={() => setSelectedUser(userProgress)}
              className={`flex items-center w-full p-2 px-4 rounded-xl hover:bg-gray-200/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                isMe ? "bg-green-100/50 dark:bg-green-900/20" : ""
              } ${isRival ? "border-2 border-rose-300 dark:border-rose-800" : ""}`}
            >
              <p className="font-bold text-lime-700 dark:text-lime-500 mr-4 w-6 text-center">{actualRank}</p>
              <Avatar className={`border-2 h-12 w-12 ml-3 mr-6 ${getBorderStyles(userProgress.activeBorder)}`}>
                <AvatarImage className="object-cover" src={userProgress.userImageSrc} />
              </Avatar>
              <p className="font-bold text-neutral-800 dark:text-white flex-1 truncate">
                {userProgress.userName} {isMe && "(Tú)"}
              </p>
              <p className="text-muted-foreground font-bold">
                {isWeekly ? userProgress.weeklyPoints : userProgress.points} XP
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="weekly" className="font-bold text-md">Semanal (Liga)</TabsTrigger>
          <TabsTrigger value="alltime" className="font-bold text-md">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          {renderList(weeklyData, true)}
        </TabsContent>
        <TabsContent value="alltime">
          {renderList(allTimeData, false)}
        </TabsContent>
      </Tabs>

      <UserProfileDialog 
        isOpen={!!selectedUser} 
        setIsOpen={(open) => !open && setSelectedUser(null)} 
        user={selectedUser} 
      />
    </>
  );
};
