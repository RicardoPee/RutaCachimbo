import Image from "next/image";
import { redirect } from "next/navigation";

import { Promo } from "@/components/promo";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { getUserProgress, getUserSubscription, getDynamicQuests } from "@/db/queries";

import { Items } from "./items";
import { Quests } from "@/components/quests";

const ShopPage = async () => {
  const userProgressData = getUserProgress();
  const userSubscriptionData = getUserSubscription();
  const dynamicQuestsData = getDynamicQuests();

  const [
    userProgress,
    userSubscription,
    dynamicQuests,
  ] = await Promise.all([
    userProgressData,
    userSubscriptionData,
    dynamicQuestsData,
  ]);

  if (!userProgress || !userProgress.activeCourse) {
    redirect("/courses");
  }

  const isPro = !!userSubscription?.isActive;

  return ( 
    <div className="flex flex-row-reverse gap-6 lg:gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
          streak={userProgress.streak}
        />
        {!isPro && (
          <Promo />
        )}
        <Quests quests={dynamicQuests} />
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center">
          <Image
            src="/shop.svg"
            alt="Shop"
            height={90}
            width={90}
          />
          <h1 className="text-center font-extrabold text-neutral-800 dark:text-white text-3xl my-4">
            Tienda Cachimbo
          </h1>
          <p className="text-muted-foreground text-center text-base mb-8 max-w-[520px]">
            Equípate con comodines estratégicos para tus exámenes, personaliza tu mascota acompañante y desbloquea atuendos únicos.
          </p>
          <Items
            hearts={userProgress.hearts}
            points={userProgress.points}
            hasActiveSubscription={isPro}
            streak={userProgress.streak}
            streakFreeze={userProgress.streakFreeze}
            xpBoosterEndsAt={userProgress.xpBoosterEndsAt}
            ownedBorders={userProgress.ownedBorders || []}
            activeBorder={userProgress.activeBorder}
            userImageSrc={userProgress.userImageSrc || "/mascot.svg"}
            userName={userProgress.userName || "Estudiante"}
            ownedTitles={userProgress.ownedTitles || []}
            activeTitle={userProgress.activeTitle}
            cardFiftyFifty={userProgress.cardFiftyFifty || 0}
            cardAiHint={userProgress.cardAiHint || 0}
            cardHeartShield={userProgress.cardHeartShield || 0}
            activeMascotSkin={userProgress.activeMascotSkin || "default"}
            ownedMascotSkins={userProgress.ownedMascotSkins || ["default"]}
          />
        </div>
      </FeedWrapper>
    </div>
  );
};
 
export default ShopPage;
