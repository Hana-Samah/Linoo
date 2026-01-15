/* =============================================
   📚 بيانات القصص التعليمية (ABA) + الكويز
   ============================================= */

export const stories = [
  {
    id: "story1",
    title: "غسل اليدين",
    description: "تعلم كيفية غسل اليدين بطريقة صحيحة",
    coverImage: require("../../assets/stories/handwash/cover.jpg"),
    category: "نظافة",
    readCount: 0,
    scenes: [
      {
        id: 1,
        video: require("../../assets/stories/handwash/scene1.mp4"),
        text: "أحمد يريد أن يأكل، لكن يديه متسختان.",
        audio: null,
      },
      {
        id: 2,
        video: require("../../assets/stories/handwash/scene2.mp4"),
        text: "أحمد يذهب إلى الحمام لغسل يديه.",
        audio: null,
      },
      {
        id: 3,
        video: require("../../assets/stories/handwash/scene3.mp4"),
        text: "يفتح أحمد صنبور الماء.",
        audio: null,
      },
      {
        id: 4,
        video: require("../../assets/stories/handwash/scene4.mp4"),
        text: "يضع الصابون على يديه ويفركهما جيداً.",
        audio: null,
      },
      {
        id: 5,
        video: require("../../assets/stories/handwash/scene5.mp4"),
        text: "يشطف أحمد يديه بالماء النظيف.",
        audio: null,
      },
      {
        id: 6,
        video: require("../../assets/stories/handwash/scene6.mp4"),
        text: "يجفف أحمد يديه بالمنشفة. أحسنت يا أحمد!",
        audio: null,
      },
    ],
    quiz: {
      question: "متى يجب أن نغسل اليدين؟",
      options: [
        {
          id: "correct",
          text: "قبل الأكل",
          image: require("../../assets/stories/handwash/Canswer.png"),
          isCorrect: true,
        },
        {
          id: "wrong",
          text: "عند اللعب",
          image: require("../../assets/stories/handwash/Ranswer.png"),
          isCorrect: false,
        },
      ],
    },
  },

  {
    id: "story2",
    title: "تنظيف الأسنان",
    description: "خطوات تنظيف الأسنان الصحيحة",
    coverImage: require("../../assets/stories/teeth/cover.jpg"),
    category: "نظافة",
    readCount: 0,
    scenes: [
      {
        id: 1,
        video: require("../../assets/stories/teeth/scene1.mp4"),
        text: "سارة تستيقظ في الصباح.",
        audio: null,
      },
      {
        id: 2,
        video: require("../../assets/stories/teeth/scene2.mp4"),
        text: "تذهب سارة إلى الحمام لتنظف أسنانها.",
        audio: null,
      },
      {
        id: 3,
        video: require("../../assets/stories/teeth/scene3.mp4"),
        text: "تضع معجون الأسنان على الفرشاة.",
        audio: null,
      },
      {
        id: 4,
        video: require("../../assets/stories/teeth/scene4.mp4"),
        text: "تفرش سارة أسنانها بحركات دائرية.",
        audio: null,
      },
      {
        id: 5,
        video: require("../../assets/stories/teeth/scene5.mp4"),
        text: "تشطف سارة فمها بالماء.",
        audio: null,
      },
      {
        id: 6,
        video: require("../../assets/stories/teeth/scene6.mp4"),
        text: "أسنان سارة نظيفة ولامعة الآن! رائع!",
        audio: null,
      },
    ],
    quiz: {
      question: "كيف نحافظ على الاسنان",
      options: [
        {
          id: "correct",
          text: "نفرشها في الصباح والمساء",
          image: require("../../assets/stories/teeth/Canswer.png"),
          isCorrect: true,
        },
        {
          id: "wrong",
          text: "لا نفرشها أبداً ونأكل الحلوات كثيرة",
          image: require("../../assets/stories/teeth/Ranswer.png"),
          isCorrect: false,
        },
      ],
    },
  },

  {
    id: "story4",
    title: "تناول الطعام",
    description: "آداب وخطوات تناول الطعام",
    coverImage: require("../../assets/stories/eating/cover.jpg"),
    category: "آداب",
    readCount: 0,
    scenes: [
      {
        id: 1,
        video: require("../../assets/stories/eating/scene1.mp4"),
        text: "ليلى جائعة. حان وقت الغداء.",
        audio: null,
      },
      {
        id: 2,
        video: require("../../assets/stories/eating/scene2.mp4"),
        text: "تغسل ليلى يديها قبل الأكل.",
        audio: null,
      },
      {
        id: 3,
        video: require("../../assets/stories/eating/scene3.mp4"),
        text: "تجلس ليلى على الطاولة وتقول بسم الله.",
        audio: null,
      },
      {
        id: 4,
        video: require("../../assets/stories/eating/scene4.mp4"),
        text: "تستخدم الملعقة والشوكة بعنايةوتأكل بيدها اليمين.",
        audio: null,
      },
      {
        id: 5,
        video: require("../../assets/stories/eating/scene5.mp4"),
        text: "تمضغ الطعام ببطء وهدوء.",
        audio: null,
      },
      {
        id: 6,
        video: require("../../assets/stories/eating/scene6.mp4"),
        text: "بعد الأكل تقول الحمدلله، وتشكر ليلى أمها . ممتاز يا ليلى!",
        audio: null,
      },
    ],
    quiz: {
      question: "ماذا نقول قبل الأكل؟",
      options: [
        {
          id: "correct",
          text: " بسم الله ",
          image: require("../../assets/stories/eating/Canswer.png"),
          isCorrect: true,
        },
        {
          id: "wrong",
          text: "السلام عليكم",
          image: require("../../assets/stories/eating/Ranswer.png"),
          isCorrect: false,
        },
      ],
    },
  },

  {
    id: "story5",
    title: "الاستعداد للنوم",
    description: "روتين النوم الصحي",
    coverImage: require("../../assets/stories/sleep/cover.jpg"),
    category: "روتين يومي",
    readCount: 0,
    scenes: [
      {
        id: 1,
        video: require("../../assets/stories/sleep/scene1.mp4"),
        text: "حان وقت النوم. عمر متعب.",
        audio: null,
      },
      {
        id: 2,
        video: require("../../assets/stories/sleep/scene2.mp4"),
        text: "عمر يرتب ألعابه.",
        audio: null,
      },
      {
        id: 3,
        video: require("../../assets/stories/sleep/scene3.mp4"),
        text: "يذهب عمر لتنظيف أسنانه.",
        audio: null,
      },
      {
        id: 4,
        video: require("../../assets/stories/sleep/scene4.mp4"),
        text: "يستلقي عمر في سريره ويقول بسمكَ اللهمَ اموتُ واحيا.",
        audio: null,
      },
      {
        id: 5,
        video: require("../../assets/stories/sleep/scene5.mp4"),
        text: "تصبح على خير يا عمر. نوم هانئ!",
        audio: null,
      },
    ],
    quiz: {
      question: "ماذا نفعل قبل النوم؟",
      options: [
        {
          id: "correct",
          text: "ننظف الأسنان",
          image: require("../../assets/stories/sleep/Canswer.png"),
          isCorrect: true,
        },
        {
          id: "wrong",
          text: "نلعب بالكرة",
          image: require("../../assets/stories/sleep/Ranswer.png"),
          isCorrect: false,
        },
      ],
    },
  },
];

/* =============================================
   💾 إدارة عدد مرات القراءة
   ============================================= */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORIES_STATS_KEY = "STORIES_READ_COUNT";

export const getStoriesStats = async () => {
  try {
    const data = await AsyncStorage.getItem(STORIES_STATS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

export const incrementReadCount = async (storyId) => {
  try {
    const stats = await getStoriesStats();
    stats[storyId] = (stats[storyId] || 0) + 1;
    await AsyncStorage.setItem(STORIES_STATS_KEY, JSON.stringify(stats));
    return stats[storyId];
  } catch (e) {
    return 0;
  }
};

export const getStoriesSortedByReadCount = async () => {
  const stats = await getStoriesStats();

  const storiesWithStats = stories.map((story) => ({
    ...story,
    readCount: stats[story.id] || 0,
  }));

  return storiesWithStats.sort((a, b) => b.readCount - a.readCount);
};

/* =============================================
   ⭐ إدارة النجوم (Stars System)
   ============================================= */

const STARS_KEY = "USER_STARS";
const QUIZ_RESULTS_KEY = "QUIZ_RESULTS";

export const getStars = async () => {
  try {
    const data = await AsyncStorage.getItem(STARS_KEY);
    return data ? parseInt(data) : 0;
  } catch (e) {
    return 0;
  }
};

export const addStar = async () => {
  try {
    const currentStars = await getStars();
    const newStars = currentStars + 1;
    await AsyncStorage.setItem(STARS_KEY, newStars.toString());
    return newStars;
  } catch (e) {
    return 0;
  }
};

// ✅ تصليح: الدالة ترجع البيانات بعد الحفظ
export const saveQuizResult = async (storyId, isCorrect) => {
  try {
    const results = await getQuizResults();
    if (!results[storyId]) {
      results[storyId] = [];
    }
    results[storyId].push({
      timestamp: new Date().toISOString(),
      isCorrect,
    });
    await AsyncStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
    
    // ✅ نرجع البيانات المحفوظة
    return results;
  } catch (e) {
    console.error("Error saving quiz result:", e);
    return {};
  }
};

export const getQuizResults = async () => {
  try {
    const data = await AsyncStorage.getItem(QUIZ_RESULTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};