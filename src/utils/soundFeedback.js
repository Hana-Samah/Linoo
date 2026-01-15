/* =============================================
   🔊 نظام الملاحظات الصوتية (Sound Feedback)
   ============================================= */

import { Audio } from "expo-av";
import * as Speech from "expo-speech";

let currentSound = null;

/* =============================================
   🎵 أصوات التفاعل
   ============================================= */

// ✅ صوت عند الضغط على زر عادي
export const playClickSound = async () => {
  // يمكنك استبدال هذا بملف صوت حقيقي
  // const soundObject = new Audio.Sound();
  // await soundObject.loadAsync(require('../../assets/sounds/click.mp3'));
  // await soundObject.playAsync();
  
  // حالياً نستخدم beep بسيط
  Speech.speak("", { 
    rate: 2, 
    pitch: 2,
    language: "ar" 
  });
};

// ✅ صوت عند النجاح/الإنجاز
export const playSuccessSound = async () => {
  const encouragements = [
    "أحسنت!",
    "رائع!",
    "ممتاز!",
    "عمل جيد!",
    "واصل!"
  ];
  
  const random = encouragements[Math.floor(Math.random() * encouragements.length)];
  Speech.speak(random, { 
    language: "ar",
    pitch: 1.3,
    rate: 1.0
  });
};

// ✅ صوت عند إضافة كلمة للجملة
export const playWordAddedSound = async () => {
  // صوت click خفيف
  Speech.speak("", { 
    rate: 2.5, 
    pitch: 1.8,
    language: "ar" 
  });
};

// ✅ صوت احتفالي (عند إكمال جملة طويلة)
export const playCelebrationSound = async () => {
  const celebrations = [
    "يا سلام! جملة رائعة!",
    "واو! ممتاز جداً!",
    "عظيم! أنت بطل!",
    "🎉 مبروك! جملة كاملة!"
  ];
  
  const random = celebrations[Math.floor(Math.random() * celebrations.length)];
  Speech.speak(random, { 
    language: "ar",
    pitch: 1.4,
    rate: 0.95
  });
};

/* =============================================
   🎯 نظام النقاط والمكافآت
   ============================================= */

import AsyncStorage from "@react-native-async-storage/async-storage";

const POINTS_KEY = "USER_POINTS";
const ACHIEVEMENTS_KEY = "USER_ACHIEVEMENTS";

// ✅ الحصول على النقاط الحالية
export const getPoints = async () => {
  try {
    const points = await AsyncStorage.getItem(POINTS_KEY);
    return points ? parseInt(points) : 0;
  } catch (e) {
    return 0;
  }
};

// ✅ إضافة نقاط
export const addPoints = async (pointsToAdd) => {
  try {
    const currentPoints = await getPoints();
    const newPoints = currentPoints + pointsToAdd;
    await AsyncStorage.setItem(POINTS_KEY, newPoints.toString());
    
    // ✅ التحقق من الإنجازات
    await checkAchievements(newPoints);
    
    return newPoints;
  } catch (e) {
    return 0;
  }
};

// ✅ قائمة الإنجازات
export const achievements = [
  {
    id: "first_word",
    title: "الكلمة الأولى 🌟",
    description: "استخدمت أول كلمة في لوحة التواصل",
    points: 10,
    icon: "🎯"
  },
  {
    id: "first_sentence",
    title: "الجملة الأولى 💬",
    description: "كونت جملة من 3 كلمات",
    points: 20,
    icon: "💬"
  },
  {
    id: "daily_user",
    title: "المستخدم اليومي ⭐",
    description: "استخدمت التطبيق 5 أيام متتالية",
    points: 50,
    icon: "📅"
  },
  {
    id: "word_master",
    title: "خبير الكلمات 🏆",
    description: "أضفت 20 كلمة مخصصة",
    points: 100,
    icon: "🏆"
  },
  {
    id: "explorer",
    title: "المستكشف 🚀",
    description: "جربت كل أقسام التطبيق",
    points: 30,
    icon: "🚀"
  }
];

// ✅ التحقق من الإنجازات
const checkAchievements = async (points) => {
  // يمكن إضافة منطق التحقق من الإنجازات هنا
  // مثلاً: إذا وصلت 100 نقطة، تحصل على إنجاز معين
};

// ✅ الحصول على الإنجازات المكتسبة
export const getUnlockedAchievements = async () => {
  try {
    const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// ✅ فتح إنجاز جديد
export const unlockAchievement = async (achievementId) => {
  try {
    const unlocked = await getUnlockedAchievements();
    
    if (!unlocked.includes(achievementId)) {
      unlocked.push(achievementId);
      await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
      
      // ✅ إضافة نقاط الإنجاز
      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        await addPoints(achievement.points);
        
        // ✅ صوت احتفالي
        playCelebrationSound();
        
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
};