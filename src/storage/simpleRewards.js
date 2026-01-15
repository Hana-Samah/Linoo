/* =============================================
   ⭐ نظام المكافآت المبسط - نجوم فقط!
   ============================================= */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";

const STARS_KEY = "USER_STARS";
const DAILY_STREAK_KEY = "DAILY_STREAK";
const LAST_ACTIVITY_KEY = "LAST_ACTIVITY_DATE";

/* =============================================
   ⭐ إدارة النجوم
   ============================================= */

export const getStars = async () => {
  try {
    const stars = await AsyncStorage.getItem(STARS_KEY);
    return stars ? parseInt(stars) : 0;
  } catch (error) {
    console.error("Error getting stars:", error);
    return 0;
  }
};

export const addStars = async (amount, reason = "") => {
  try {
    const currentStars = await getStars();
    const newStars = currentStars + amount;
    await AsyncStorage.setItem(STARS_KEY, newStars.toString());
    
    console.log(`⭐ +${amount} نجمة: ${reason}`);
    
    return {
      newStars,
      starsAdded: amount,
      reason,
    };
  } catch (error) {
    console.error("Error adding stars:", error);
    return null;
  }
};

// أسباب الحصول على النجوم
export const STAR_REASONS = {
  STORY_READ: { amount: 1, text: "قراءة قصة" },
  QUIZ_CORRECT: { amount: 1, text: "إجابة صحيحة" },
  WORDS_10: { amount: 1, text: "استخدام 10 كلمات" },
  DAILY_LOGIN: { amount: 1, text: "استخدام التطبيق اليوم" },
};

/* =============================================
   🔥 نظام الاستمرارية (Streak)
   ============================================= */

export const updateDailyStreak = async () => {
  try {
    const today = new Date().toLocaleDateString("ar-SA");
    const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
    const currentStreak = await getCurrentStreak();
    
    if (lastActivity === today) {
      return currentStreak;
    }
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("ar-SA");
    
    let newStreak;
    if (lastActivity === yesterday) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }
    
    await AsyncStorage.setItem(DAILY_STREAK_KEY, newStreak.toString());
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, today);
    
    // مكافأة يومية
    if (newStreak === 1) {
      await addStars(STAR_REASONS.DAILY_LOGIN.amount, STAR_REASONS.DAILY_LOGIN.text);
    }
    
    return newStreak;
  } catch (error) {
    console.error("Error updating streak:", error);
    return 0;
  }
};

export const getCurrentStreak = async () => {
  try {
    const streak = await AsyncStorage.getItem(DAILY_STREAK_KEY);
    return streak ? parseInt(streak) : 0;
  } catch (error) {
    console.error("Error getting streak:", error);
    return 0;
  }
};

/* =============================================
   🎁 المكافآت الخاصة
   ============================================= */

export const checkSpecialRewards = async (stars) => {
  const rewards = [
    { stars: 5, title: "بطل صغير!", message: "حصلت على 5 نجوم!", icon: "🌟" },
    { stars: 10, title: "نجم متألق!", message: "حصلت على 10 نجوم!", icon: "✨" },
    { stars: 20, title: "بطل خارق!", message: "حصلت على 20 نجمة!", icon: "🏆" },
    { stars: 50, title: "أسطورة!", message: "حصلت على 50 نجمة!", icon: "👑" },
  ];
  
  // نشوف آخر مكافأة حصل عليها
  const lastRewardKey = "LAST_SPECIAL_REWARD";
  const lastReward = await AsyncStorage.getItem(lastRewardKey);
  const lastRewardStars = lastReward ? parseInt(lastReward) : 0;
  
  // نشوف هل وصل لمكافأة جديدة
  for (const reward of rewards) {
    if (stars >= reward.stars && lastRewardStars < reward.stars) {
      await AsyncStorage.setItem(lastRewardKey, reward.stars.toString());
      return reward;
    }
  }
  
  return null;
};

/* =============================================
   📊 إحصائيات بسيطة
   ============================================= */

export const getSimpleStats = async () => {
  try {
    const stars = await getStars();
    const streak = await getCurrentStreak();
    
    return {
      stars,
      streak,
      nextReward: getNextReward(stars),
    };
  } catch (error) {
    console.error("Error getting simple stats:", error);
    return {
      stars: 0,
      streak: 0,
      nextReward: null,
    };
  }
};

const getNextReward = (currentStars) => {
  const rewards = [5, 10, 20, 50, 100];
  
  for (const reward of rewards) {
    if (currentStars < reward) {
      return {
        starsNeeded: reward,
        remaining: reward - currentStars,
      };
    }
  }
  
  return null; // وصل لأعلى مستوى
};

/* =============================================
   🎉 رسائل تحفيزية
   ============================================= */

export const getMotivationalMessage = (stars) => {
  if (stars < 5) {
    return "استمر! أنت في البداية! 🌱";
  } else if (stars < 10) {
    return "رائع! تقدم ممتاز! ⭐";
  } else if (stars < 20) {
    return "مذهل! أنت نجم! 🌟";
  } else if (stars < 50) {
    return "خارق! أنت بطل! 🏆";
  } else {
    return "أسطوري! أنت الأفضل! 👑";
  }
};

/* =============================================
   🗑️ إعادة تعيين
   ============================================= */

export const resetAllRewards = async () => {
  try {
    await AsyncStorage.multiRemove([
      STARS_KEY,
      DAILY_STREAK_KEY,
      LAST_ACTIVITY_KEY,
      "LAST_SPECIAL_REWARD",
    ]);
    return true;
  } catch (error) {
    console.error("Error resetting rewards:", error);
    return false;
  }
};