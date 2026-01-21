/* =============================================
   🦁 نظام شعر الأسد اليومي - نسخة متوازنة
   8 خصلات = 8 إنجازات يومية (بتحكم أفضل)
   ============================================= */

import AsyncStorage from "@react-native-async-storage/async-storage";

const DAILY_PROGRESS_KEY = "DAILY_LION_PROGRESS";
const LAST_RESET_DATE_KEY = "LAST_LION_RESET_DATE";
const DAILY_ACTIONS_COUNT_KEY = "DAILY_ACTIONS_COUNT";

const MAX_DAILY_PROGRESS = 8; // 8 خصلات

/* =============================================
   🎯 معايير الإنجازات المتوازنة
   ============================================= */

// عدد الإجراءات المطلوبة لكل خصلة
const ACTIONS_PER_HAIR = {
  AAC_WORDS: 5,          // 5 كلمات = خصلة واحدة
  AAC_SENTENCES: 2,      // جملتان كاملتان = خصلة واحدة
  STORY_COMPLETED: 1,    // قصة واحدة = خصلة واحدة
  QUIZ_CORRECT: 1,       // إجابة صحيحة = خصلة واحدة
};

// الحد الأقصى للخصلات من كل نوع (منع التكرار المفرط)
const MAX_HAIRS_PER_TYPE = {
  AAC_WORDS: 3,          // أقصى 3 خصلات من الكلمات
  AAC_SENTENCES: 2,      // أقصى 2 خصلة من الجمل
  STORY_COMPLETED: 2,    // أقصى 2 خصلة من القصص
  QUIZ_CORRECT: 2,       // أقصى 2 خصلة من الكويز
};

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
   📈 الحصول على عدد الإجراءات اليومية
   ============================================= */

const getDailyActionsCount = async () => {
  try {
    const data = await AsyncStorage.getItem(DAILY_ACTIONS_COUNT_KEY);
    return data ? JSON.parse(data) : {
      aacWords: 0,
      aacSentences: 0,
      storiesCompleted: 0,
      quizzesCorrect: 0,
    };
  } catch (error) {
    return {
      aacWords: 0,
      aacSentences: 0,
      storiesCompleted: 0,
      quizzesCorrect: 0,
    };
  }
};

const saveDailyActionsCount = async (counts) => {
  try {
    await AsyncStorage.setItem(DAILY_ACTIONS_COUNT_KEY, JSON.stringify(counts));
  } catch (error) {
    console.error("Error saving actions count:", error);
  }
};

/* =============================================
   ➕ إضافة تقدم (نمو خصلة) - مع تحكم ذكي
   ============================================= */

export const addDailyProgress = async (actionType, reason = "") => {
  try {
    await checkAndResetIfNewDay();
    
    const currentProgress = await getDailyProgress();
    const actionCounts = await getDailyActionsCount();
    
    // إذا وصل للحد الأقصى
    if (currentProgress >= MAX_DAILY_PROGRESS) {
      return {
        progress: currentProgress,
        maxReached: true,
        message: "أحسنت! أكملت كل إنجازات اليوم! 🎉",
        hairGrown: false,
      };
    }

    // حساب الخصلات المكتسبة من هذا النوع
    let hairsFromThisType = 0;
    let shouldAddHair = false;

    switch (actionType) {
      case "AAC_WORD":
        actionCounts.aacWords += 1;
        hairsFromThisType = Math.floor(actionCounts.aacWords / ACTIONS_PER_HAIR.AAC_WORDS);
        
        if (
          actionCounts.aacWords % ACTIONS_PER_HAIR.AAC_WORDS === 0 &&
          hairsFromThisType <= MAX_HAIRS_PER_TYPE.AAC_WORDS
        ) {
          shouldAddHair = true;
        }
        break;

      case "AAC_SENTENCE":
        actionCounts.aacSentences += 1;
        hairsFromThisType = Math.floor(actionCounts.aacSentences / ACTIONS_PER_HAIR.AAC_SENTENCES);
        
        if (
          actionCounts.aacSentences % ACTIONS_PER_HAIR.AAC_SENTENCES === 0 &&
          hairsFromThisType <= MAX_HAIRS_PER_TYPE.AAC_SENTENCES
        ) {
          shouldAddHair = true;
        }
        break;

      case "STORY_COMPLETED":
        actionCounts.storiesCompleted += 1;
        hairsFromThisType = actionCounts.storiesCompleted;
        
        if (hairsFromThisType <= MAX_HAIRS_PER_TYPE.STORY_COMPLETED) {
          shouldAddHair = true;
        }
        break;

      case "QUIZ_CORRECT":
        actionCounts.quizzesCorrect += 1;
        hairsFromThisType = actionCounts.quizzesCorrect;
        
        if (hairsFromThisType <= MAX_HAIRS_PER_TYPE.QUIZ_CORRECT) {
          shouldAddHair = true;
        }
        break;
    }

    // حفظ العدادات
    await saveDailyActionsCount(actionCounts);

    // إذا لم يستحق خصلة جديدة
    if (!shouldAddHair) {
      console.log(`⏳ لم تنمو خصلة بعد - ${reason}`);
      return {
        progress: currentProgress,
        hairGrown: false,
        message: getProgressMessage(actionType, actionCounts),
        actionsNeeded: getActionsNeeded(actionType, actionCounts),
      };
    }

    // ✅ نمو خصلة جديدة!
    const newProgress = Math.min(currentProgress + 1, MAX_DAILY_PROGRESS);
    await AsyncStorage.setItem(DAILY_PROGRESS_KEY, newProgress.toString());
    
    console.log(`🦁 نمت خصلة! ${newProgress}/${MAX_DAILY_PROGRESS} - السبب: ${reason}`);
    
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
      hairGrown: true,
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
   📝 رسائل التقدم
   ============================================= */

const getProgressMessage = (actionType, counts) => {
  switch (actionType) {
    case "AAC_WORD":
      const wordsNeeded = ACTIONS_PER_HAIR.AAC_WORDS - (counts.aacWords % ACTIONS_PER_HAIR.AAC_WORDS);
      if (counts.aacWords >= ACTIONS_PER_HAIR.AAC_WORDS * MAX_HAIRS_PER_TYPE.AAC_WORDS) {
        return "وصلت للحد الأقصى من الكلمات اليوم! جرب نشاط آخر 🎯";
      }
      return `استخدم ${wordsNeeded} كلمات أخرى لخصلة جديدة! 💬`;

    case "AAC_SENTENCE":
      const sentencesNeeded = ACTIONS_PER_HAIR.AAC_SENTENCES - (counts.aacSentences % ACTIONS_PER_HAIR.AAC_SENTENCES);
      if (counts.aacSentences >= ACTIONS_PER_HAIR.AAC_SENTENCES * MAX_HAIRS_PER_TYPE.AAC_SENTENCES) {
        return "وصلت للحد الأقصى من الجمل اليوم! جرب نشاط آخر 🎯";
      }
      return `كوّن ${sentencesNeeded} جملة أخرى لخصلة جديدة! 💪`;

    case "STORY_COMPLETED":
      if (counts.storiesCompleted >= MAX_HAIRS_PER_TYPE.STORY_COMPLETED) {
        return "وصلت للحد الأقصى من القصص اليوم! جرب نشاط آخر 🎯";
      }
      return "أكمل قصة واحدة لخصلة جديدة! 📚";

    case "QUIZ_CORRECT":
      if (counts.quizzesCorrect >= MAX_HAIRS_PER_TYPE.QUIZ_CORRECT) {
        return "وصلت للحد الأقصى من الأسئلة اليوم! جرب نشاط آخر 🎯";
      }
      return "أجب على سؤال بشكل صحيح لخصلة جديدة! 🎯";

    default:
      return "استمر! أنت تقوم بعمل رائع! 💪";
  }
};

const getActionsNeeded = (actionType, counts) => {
  switch (actionType) {
    case "AAC_WORD":
      return ACTIONS_PER_HAIR.AAC_WORDS - (counts.aacWords % ACTIONS_PER_HAIR.AAC_WORDS);
    case "AAC_SENTENCE":
      return ACTIONS_PER_HAIR.AAC_SENTENCES - (counts.aacSentences % ACTIONS_PER_HAIR.AAC_SENTENCES);
    default:
      return 1;
  }
};

/* =============================================
   🔄 التحقق من يوم جديد وإعادة التعيين
   ============================================= */

export const checkAndResetIfNewDay = async () => {
  try {
    const today = new Date().toLocaleDateString("ar-SA");
    const lastResetDate = await AsyncStorage.getItem(LAST_RESET_DATE_KEY);
    
    if (lastResetDate !== today) {
      console.log("🌅 يوم جديد! الأسد يبدأ أصلع...");
      await AsyncStorage.setItem(DAILY_PROGRESS_KEY, "0");
      await AsyncStorage.setItem(LAST_RESET_DATE_KEY, today);
      await AsyncStorage.setItem(DAILY_ACTIONS_COUNT_KEY, JSON.stringify({
        aacWords: 0,
        aacSentences: 0,
        storiesCompleted: 0,
        quizzesCorrect: 0,
      }));
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
    const actionCounts = await getDailyActionsCount();
    const percentage = Math.round((progress / MAX_DAILY_PROGRESS) * 100);
    const remaining = MAX_DAILY_PROGRESS - progress;
    
    return {
      progress,
      maxProgress: MAX_DAILY_PROGRESS,
      percentage,
      remaining,
      isComplete: progress === MAX_DAILY_PROGRESS,
      actionCounts,
    };
  } catch (error) {
    console.error("Error getting lion stats:", error);
    return {
      progress: 0,
      maxProgress: MAX_DAILY_PROGRESS,
      percentage: 0,
      remaining: MAX_DAILY_PROGRESS,
      isComplete: false,
      actionCounts: {
        aacWords: 0,
        aacSentences: 0,
        storiesCompleted: 0,
        quizzesCorrect: 0,
      },
    };
  }
};

/* =============================================
   🗑️ إعادة تعيين يدوي (للتطوير)
   ============================================= */

export const resetDailyProgress = async () => {
  try {
    await AsyncStorage.multiRemove([
      DAILY_PROGRESS_KEY,
      DAILY_ACTIONS_COUNT_KEY,
    ]);
    console.log("🔄 تم إعادة تعيين تقدم الأسد");
    return true;
  } catch (error) {
    console.error("Error resetting daily progress:", error);
    return false;
  }
};