/* =============================================
   🦁 نظام شعر الأسد اليومي - Linoo
   8 خصلات = 8 إنجازات يومية
   كل يوم جديد = أسد أصلع
   ============================================= */

import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_PROGRESS_KEY = "DAILY_LION_PROGRESS";
const LAST_RESET_DATE_KEY = "LAST_LION_RESET_DATE";

const MAX_DAILY_PROGRESS = 8; // 8 خصلات

/* =============================================
   📊 الحصول على التقدم اليومي
   ============================================= */

export const getDailyProgress = async () => {
  try {
    await checkAndResetIfNewDay();
    
    const progress = await AsyncStorage.getItem(DAILY_PROGRESS_KEY);
    return progress ? parseInt(progress) : 0;
  } catch (error) {
    console.error("Error getting daily progress:", error);
    return 0;
  }
};

/* =============================================
   ➕ إضافة تقدم (نمو خصلة)
   ============================================= */

export const addDailyProgress = async (amount = 1, reason = "") => {
  try {
    await checkAndResetIfNewDay();
    
    const currentProgress = await getDailyProgress();
    
    // لا نتجاوز 8
    if (currentProgress >= MAX_DAILY_PROGRESS) {
      return {
        progress: currentProgress,
        maxReached: true,
        message: "أحسنت! أكملت كل إنجازات اليوم! 🎉",
      };
    }
    
    const newProgress = Math.min(currentProgress + amount, MAX_DAILY_PROGRESS);
    await AsyncStorage.setItem(DAILY_PROGRESS_KEY, newProgress.toString());
    
    console.log(`🦁 نمت خصلة! ${newProgress}/${MAX_DAILY_PROGRESS} - السبب: ${reason}`);
    
    // رسالة حسب التقدم
    let message = "";
    if (newProgress === MAX_DAILY_PROGRESS) {
      message = "🎉 مذهل! شعر الأسد اكتمل! أنت بطل!";
    } else if (newProgress >= 6) {
      message = "💪 ممتاز! شعر الأسد يكاد يكتمل!";
    } else if (newProgress >= 3) {
      message = "⭐ رائع! نصف الطريق!";
    } else {
      message = "🌱 عمل جيد! استمر!";
    }
    
    return {
      progress: newProgress,
      oldProgress: currentProgress,
      added: amount,
      maxReached: newProgress === MAX_DAILY_PROGRESS,
      message,
      reason,
    };
  } catch (error) {
    console.error("Error adding daily progress:", error);
    return null;
  }
};

/* =============================================
   🔄 التحقق من يوم جديد وإعادة التعيين
   ============================================= */

export const checkAndResetIfNewDay = async () => {
  try {
    const today = new Date().toLocaleDateString("ar-SA");
    const lastResetDate = await AsyncStorage.getItem(LAST_RESET_DATE_KEY);
    
    // إذا يوم جديد، نصفر التقدم
    if (lastResetDate !== today) {
      console.log("🌅 يوم جديد! الأسد يبدأ أصلع...");
      await AsyncStorage.setItem(DAILY_PROGRESS_KEY, "0");
      await AsyncStorage.setItem(LAST_RESET_DATE_KEY, today);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking reset:", error);
    return false;
  }
};

/* =============================================
   📈 الحصول على معلومات كاملة
   ============================================= */

export const getDailyLionStats = async () => {
  try {
    const progress = await getDailyProgress();
    const percentage = Math.round((progress / MAX_DAILY_PROGRESS) * 100);
    const remaining = MAX_DAILY_PROGRESS - progress;
    
    return {
      progress,
      maxProgress: MAX_DAILY_PROGRESS,
      percentage,
      remaining,
      isComplete: progress === MAX_DAILY_PROGRESS,
    };
  } catch (error) {
    console.error("Error getting lion stats:", error);
    return {
      progress: 0,
      maxProgress: MAX_DAILY_PROGRESS,
      percentage: 0,
      remaining: MAX_DAILY_PROGRESS,
      isComplete: false,
    };
  }
};

/* =============================================
   🎯 أسباب الإنجازات (للمرجع)
   ============================================= */

export const PROGRESS_REASONS = {
  AAC_WORD_USED: "استخدام كلمة في لوحة AAC",
  STORY_COMPLETED: "إكمال قراءة قصة",
  QUIZ_CORRECT: "إجابة صحيحة في الكويز",
  SENTENCE_FORMED: "تكوين جملة كاملة (3+ كلمات)",
  DAILY_LOGIN: "استخدام التطبيق اليوم",
  CUSTOM_WORD_ADDED: "إضافة كلمة مخصصة",
  STORY_QUIZ_COMPLETED: "إكمال قصة + كويز",
  EXPLORATION: "استكشاف ميزة جديدة",
};

/* =============================================
   🗑️ إعادة تعيين يدوي (للتطوير)
   ============================================= */

export const resetDailyProgress = async () => {
  try {
    await AsyncStorage.setItem(DAILY_PROGRESS_KEY, "0");
    console.log("🔄 تم إعادة تعيين تقدم الأسد");
    return true;
  } catch (error) {
    console.error("Error resetting daily progress:", error);
    return false;
  }
};