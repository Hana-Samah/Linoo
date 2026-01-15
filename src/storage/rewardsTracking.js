/* =============================================
   ⭐ نظام المكافآت المبسط - Linoo
   مصمم خصيصاً لأطفال التوحد
   ============================================= */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";

const STARS_KEY = "USER_STARS";
const LEVEL_KEY = "USER_LEVEL";
const STREAK_KEY = "DAILY_STREAK";
const LAST_ACTIVITY_KEY = "LAST_ACTIVITY_DATE";
const ACHIEVEMENTS_KEY = "USER_ACHIEVEMENTS";

/* =============================================
   ⭐ نظام النجوم (المكافأة الرئيسية)
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
    
    // تحديث المستوى تلقائياً
    await updateLevel(newStars);
    
    console.log(`⭐ +${amount} نجمة! السبب: ${reason}`);
    
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

/* =============================================
   🏆 نظام المستويات (بسيط جداً)
   ============================================= */

// كل 50 نجمة = مستوى جديد
export const calculateLevel = (stars) => {
  return Math.floor(stars / 50) + 1;
};

export const getStarsForNextLevel = (currentLevel) => {
  return currentLevel * 50;
};

export const getUserLevel = async () => {
  try {
    const stars = await getStars();
    return calculateLevel(stars);
  } catch (error) {
    console.error("Error getting level:", error);
    return 1;
  }
};

export const updateLevel = async (newStars) => {
  try {
    const currentLevel = await getUserLevel();
    const newLevel = calculateLevel(newStars);
    
    if (newLevel > currentLevel) {
      // 🎉 مستوى جديد!
      console.log(`🎉 مستوى جديد: ${newLevel}`);
      
      Speech.speak(`مبروك! وصلت للمستوى ${newLevel}!`, {
        language: "ar",
        pitch: 1.4,
        rate: 0.6,
      });
      
      // إنجاز المستوى
      await unlockAchievement(`level_${newLevel}`, {
        id: `level_${newLevel}`,
        name: `المستوى ${newLevel}`,
        description: `وصلت إلى المستوى ${newLevel}`,
        icon: getLevelIcon(newLevel),
        stars: 0, // المستويات ما تعطي نجوم إضافية
      });
      
      return { levelUp: true, newLevel, oldLevel: currentLevel };
    }
    
    return { levelUp: false, newLevel, oldLevel: currentLevel };
  } catch (error) {
    console.error("Error updating level:", error);
    return { levelUp: false };
  }
};

const getLevelIcon = (level) => {
  if (level === 1) return "🌱";
  if (level === 2) return "🌿";
  if (level === 3) return "🌳";
  if (level === 4) return "🏆";
  if (level >= 5) return "👑";
  return "⭐";
};

/* =============================================
   🏅 نظام الإنجازات (مبسط)
   ============================================= */

export const ACHIEVEMENTS_LIST = {
  // إنجازات الكلمات
  first_word: {
    id: "first_word",
    name: "الكلمة الأولى",
    description: "استخدمت أول كلمة في لوحة التواصل",
    icon: "🌟",
    stars: 5,
    type: "word",
  },
  word_explorer: {
    id: "word_explorer",
    name: "مستكشف الكلمات",
    description: "استخدمت 25 كلمة مختلفة",
    icon: "🔍",
    stars: 10,
    type: "word",
  },
  
  // إنجازات القصص
  first_story: {
    id: "first_story",
    name: "قارئ مبتدئ",
    description: "أنهيت أول قصة",
    icon: "📖",
    stars: 5,
    type: "story",
  },
  story_lover: {
    id: "story_lover",
    name: "محب القصص",
    description: "أنهيت 5 قصص",
    icon: "📚",
    stars: 15,
    type: "story",
  },
  
  // إنجازات الكويز
  quiz_master: {
    id: "quiz_master",
    name: "بطل الأسئلة",
    description: "أجبت على 10 أسئلة بشكل صحيح",
    icon: "🎯",
    stars: 20,
    type: "quiz",
  },
  
  // إنجازات الاستمرارية
  streak_3: {
    id: "streak_3",
    name: "ثلاثة أيام",
    description: "استخدمت التطبيق 3 أيام متتالية",
    icon: "🔥",
    stars: 10,
    type: "streak",
  },
  streak_7: {
    id: "streak_7",
    name: "أسبوع كامل",
    description: "استخدمت التطبيق 7 أيام متتالية",
    icon: "⭐",
    stars: 25,
    type: "streak",
  },
};

export const getAchievements = async () => {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting achievements:", error);
    return {};
  }
};

export const unlockAchievement = async (achievementId, customData = null) => {
  try {
    const achievements = await getAchievements();
    
    // إذا الإنجاز محقق من قبل، ما نكرره
    if (achievements[achievementId]) {
      return null;
    }
    
    const achievement = customData || ACHIEVEMENTS_LIST[achievementId];
    
    if (!achievement) {
      return null;
    }
    
    // حفظ الإنجاز
    achievements[achievementId] = {
      ...achievement,
      unlockedAt: new Date().toISOString(),
      dateString: new Date().toLocaleDateString("ar-SA"),
    };
    
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    
    // إضافة النجوم
    if (achievement.stars) {
      await addStars(achievement.stars, `إنجاز: ${achievement.name}`);
    }
    
    // صوت تشجيعي
    Speech.speak(`مبروك! حصلت على إنجاز ${achievement.name}!`, {
      language: "ar",
      pitch: 1.4,
      rate: 0.6,
    });
    
    console.log(`🏅 إنجاز جديد: ${achievement.name}`);
    
    return achievements[achievementId];
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    return null;
  }
};

export const checkAchievements = async (type, count) => {
  const newAchievements = [];
  
  if (type === "word") {
    if (count === 1) newAchievements.push(await unlockAchievement("first_word"));
    if (count === 25) newAchievements.push(await unlockAchievement("word_explorer"));
  }
  
  if (type === "story") {
    if (count === 1) newAchievements.push(await unlockAchievement("first_story"));
    if (count === 5) newAchievements.push(await unlockAchievement("story_lover"));
  }
  
  if (type === "quiz") {
    if (count === 10) newAchievements.push(await unlockAchievement("quiz_master"));
  }
  
  return newAchievements.filter(a => a !== null);
};

/* =============================================
   🔥 نظام الاستمرارية (Streak)
   ============================================= */

export const updateDailyStreak = async () => {
  try {
    const today = new Date().toLocaleDateString("ar-SA");
    const lastActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
    const currentStreak = await getCurrentStreak();
    
    // إذا اليوم هو نفس آخر نشاط، ما نغير شيء
    if (lastActivity === today) {
      return currentStreak;
    }
    
    // حساب الأمس
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("ar-SA");
    
    let newStreak;
    if (lastActivity === yesterday) {
      // استمرارية متصلة
      newStreak = currentStreak + 1;
    } else {
      // انقطعت الاستمرارية، نبدأ من جديد
      newStreak = 1;
    }
    
    await AsyncStorage.setItem(STREAK_KEY, newStreak.toString());
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, today);
    
    // التحقق من إنجازات الاستمرارية
    if (newStreak === 3) await unlockAchievement("streak_3");
    if (newStreak === 7) await unlockAchievement("streak_7");
    
    console.log(`🔥 الاستمرارية: ${newStreak} يوم`);
    
    return newStreak;
  } catch (error) {
    console.error("Error updating streak:", error);
    return 0;
  }
};

export const getCurrentStreak = async () => {
  try {
    const streak = await AsyncStorage.getItem(STREAK_KEY);
    return streak ? parseInt(streak) : 0;
  } catch (error) {
    console.error("Error getting streak:", error);
    return 0;
  }
};

/* =============================================
   📊 إحصائيات شاملة
   ============================================= */

export const getCompleteStats = async () => {
  try {
    const stars = await getStars();
    const level = await getUserLevel();
    const achievements = await getAchievements();
    const streak = await getCurrentStreak();
    
    const achievementsCount = Object.keys(achievements).length;
    const totalAchievements = Object.keys(ACHIEVEMENTS_LIST).length;
    const achievementProgress = Math.round((achievementsCount / totalAchievements) * 100);
    
    const nextLevelStars = getStarsForNextLevel(level);
    const starsInCurrentLevel = stars - ((level - 1) * 50);
    const levelProgress = Math.round((starsInCurrentLevel / 50) * 100);
    
    return {
      stars,
      level,
      levelProgress,
      nextLevelStars,
      achievements: Object.values(achievements),
      achievementsCount,
      totalAchievements,
      achievementProgress,
      streak,
    };
  } catch (error) {
    console.error("Error getting complete stats:", error);
    return null;
  }
};

/* =============================================
   🎁 رسائل تحفيزية
   ============================================= */

export const getMotivationalMessage = () => {
  const messages = [
    "أنت تقوم بعمل رائع! 🌟",
    "استمر في التواصل الجميل! 💪",
    "كل يوم تصبح أفضل! 🚀",
    "ممتاز! أنت بطل حقيقي! 🏆",
    "رائع! أنت نجم ساطع! ⭐",
    "أحسنت! فخور بك! 🎉",
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

/* =============================================
   🗑️ إعادة تعيين البيانات
   ============================================= */

export const resetAllRewards = async () => {
  try {
    await AsyncStorage.multiRemove([
      STARS_KEY,
      LEVEL_KEY,
      ACHIEVEMENTS_KEY,
      STREAK_KEY,
      LAST_ACTIVITY_KEY,
    ]);
    console.log("✅ تم إعادة تعيين جميع المكافآت");
    return true;
  } catch (error) {
    console.error("Error resetting rewards:", error);
    return false;
  }
};

/* =============================================
   🎯 دوال التوافق مع الكود القديم
   (حتى ما تخرب الملفات الثانية)
   ============================================= */

// النقاط = النجوم (للتوافق)
export const getPoints = getStars;
export const addPoints = addStars;

// دوال فارغة للتوافق
export const updateWeeklyGoals = async (type) => {
  // ما عاد نستخدم الأهداف الأسبوعية
  return true;
};

export const getWeeklyGoals = async () => {
  // ما عاد نستخدم الأهداف الأسبوعية
  return null;
};

export const getPointsForNextLevel = getStarsForNextLevel;