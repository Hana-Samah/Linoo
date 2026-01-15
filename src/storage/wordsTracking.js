/* =============================================
   📊 نظام تتبع استخدام الكلمات
   ============================================= */

import AsyncStorage from "@react-native-async-storage/async-storage";

const WORD_USAGE_KEY = "WORD_USAGE_STATS";
const DAILY_STATS_KEY = "DAILY_USAGE_STATS";

/* =============================================
   📈 تسجيل استخدام كلمة
   ============================================= */

export const trackWordUsage = async (wordId, wordText) => {
  try {
    // الحصول على الإحصائيات الحالية
    const stats = await getWordUsageStats();
    
    // إذا الكلمة موجودة، نزيد العداد
    if (stats[wordId]) {
      stats[wordId].count += 1;
      stats[wordId].lastUsed = new Date().toISOString();
      stats[wordId].history.push({
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString("ar-SA"),
      });
    } else {
      // إذا الكلمة جديدة، ننشئ سجل لها
      stats[wordId] = {
        wordText,
        count: 1,
        firstUsed: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        history: [
          {
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString("ar-SA"),
          },
        ],
      };
    }

    // حفظ الإحصائيات
    await AsyncStorage.setItem(WORD_USAGE_KEY, JSON.stringify(stats));
    
    // تحديث الإحصائيات اليومية
    await updateDailyStats(wordId, wordText);
    
    return stats[wordId];
  } catch (error) {
    console.error("Error tracking word usage:", error);
    return null;
  }
};

/* =============================================
   📊 الحصول على إحصائيات الكلمات
   ============================================= */

export const getWordUsageStats = async () => {
  try {
    const data = await AsyncStorage.getItem(WORD_USAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting word usage stats:", error);
    return {};
  }
};

/* =============================================
   🏆 الكلمات الأكثر استخداماً
   ============================================= */

export const getTopUsedWords = async (limit = 10) => {
  try {
    const stats = await getWordUsageStats();
    
    // تحويل الكائن إلى مصفوفة
    const wordsArray = Object.keys(stats).map((wordId) => ({
      wordId,
      ...stats[wordId],
    }));

    // ترتيب حسب الاستخدام
    const sorted = wordsArray.sort((a, b) => b.count - a.count);

    // إرجاع أعلى X كلمات
    return sorted.slice(0, limit);
  } catch (error) {
    console.error("Error getting top words:", error);
    return [];
  }
};

/* =============================================
   📅 الإحصائيات اليومية
   ============================================= */

export const updateDailyStats = async (wordId, wordText) => {
  try {
    const today = new Date().toLocaleDateString("ar-SA");
    const dailyStats = await getDailyStats();

    if (!dailyStats[today]) {
      dailyStats[today] = {
        date: today,
        totalWords: 0,
        uniqueWords: 0,
        words: {},
      };
    }

    // تحديث عدد الكلمات الكلي
    dailyStats[today].totalWords += 1;

    // تحديث الكلمة
    if (dailyStats[today].words[wordId]) {
      dailyStats[today].words[wordId].count += 1;
    } else {
      dailyStats[today].words[wordId] = {
        wordText,
        count: 1,
      };
      dailyStats[today].uniqueWords += 1;
    }

    await AsyncStorage.setItem(DAILY_STATS_KEY, JSON.stringify(dailyStats));
  } catch (error) {
    console.error("Error updating daily stats:", error);
  }
};

export const getDailyStats = async () => {
  try {
    const data = await AsyncStorage.getItem(DAILY_STATS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error getting daily stats:", error);
    return {};
  }
};

/* =============================================
   📈 إحصائيات الأسبوع الحالي
   ============================================= */

export const getWeeklyStats = async () => {
  try {
    const dailyStats = await getDailyStats();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    let totalWords = 0;
    let uniqueWords = new Set();
    const dailyData = [];

    // جمع بيانات آخر 7 أيام
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toLocaleDateString("ar-SA");
      
      if (dailyStats[dateString]) {
        totalWords += dailyStats[dateString].totalWords;
        Object.keys(dailyStats[dateString].words).forEach((wordId) => {
          uniqueWords.add(wordId);
        });
        
        dailyData.push({
          date: dateString,
          dayName: getDayName(date),
          count: dailyStats[dateString].totalWords,
        });
      } else {
        dailyData.push({
          date: dateString,
          dayName: getDayName(date),
          count: 0,
        });
      }
    }

    return {
      totalWords,
      uniqueWords: uniqueWords.size,
      dailyData: dailyData.reverse(), // من الأقدم للأحدث
      averagePerDay: Math.round(totalWords / 7),
    };
  } catch (error) {
    console.error("Error getting weekly stats:", error);
    return {
      totalWords: 0,
      uniqueWords: 0,
      dailyData: [],
      averagePerDay: 0,
    };
  }
};

/* =============================================
   🎯 إحصائيات لكلمة معينة
   ============================================= */

export const getWordStats = async (wordId) => {
  try {
    const stats = await getWordUsageStats();
    return stats[wordId] || null;
  } catch (error) {
    console.error("Error getting word stats:", error);
    return null;
  }
};

/* =============================================
   🗑️ مسح الإحصائيات
   ============================================= */

export const clearAllStats = async () => {
  try {
    await AsyncStorage.multiRemove([WORD_USAGE_KEY, DAILY_STATS_KEY]);
    return true;
  } catch (error) {
    console.error("Error clearing stats:", error);
    return false;
  }
};

/* =============================================
   🛠️ دوال مساعدة
   ============================================= */

const getDayName = (date) => {
  const days = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  return days[date.getDay()];
};

/* =============================================
   🎉 إنجازات الاستخدام
   ============================================= */

export const checkUsageAchievements = async (wordId) => {
  try {
    const wordStats = await getWordStats(wordId);
    if (!wordStats) return null;

    // إنجازات بناءً على عدد الاستخدام
    const achievements = {
      first_use: { count: 1, message: "أول استخدام للكلمة!" },
      explorer: { count: 5, message: "استخدمت الكلمة 5 مرات! 🌟" },
      expert: { count: 10, message: "خبير! 10 مرات استخدام! 🏆" },
      master: { count: 25, message: "بطل! 25 مرة! 🎉" },
    };

    for (const [key, achievement] of Object.entries(achievements)) {
      if (wordStats.count === achievement.count) {
        return {
          type: key,
          message: achievement.message,
          count: achievement.count,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return null;
  }
};