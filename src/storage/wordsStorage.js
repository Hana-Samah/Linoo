import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultWords } from "../data/defaultWords";

const WORDS_KEY = "AAC_WORDS";
const INITIALIZED_KEY = "AAC_WORDS_INITIALIZED";

/* =========================
   جلب جميع الكلمات
   ========================= */
export const getWords = async () => {
  try {
    // ✅ التحقق إذا تم التهيئة من قبل
    const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
    
    if (!initialized) {
      // ✅ أول مرة - نحفظ الكلمات الافتراضية
      await saveWords(defaultWords);
      await AsyncStorage.setItem(INITIALIZED_KEY, "true");
      return defaultWords;
    }

    const data = await AsyncStorage.getItem(WORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log("خطأ في قراءة الكلمات", e);
    return [];
  }
};

/* =========================
   حفظ جميع الكلمات (عام)
   ========================= */
export const saveWords = async (words) => {
  try {
    await AsyncStorage.setItem(WORDS_KEY, JSON.stringify(words));
  } catch (e) {
    console.log("خطأ في حفظ الكلمات", e);
  }
};

/* =========================
   إضافة كلمة جديدة
   ========================= */
export const addWord = async (word) => {
  const words = await getWords();

  const newWord = {
    id: word.id || Date.now().toString(),
    text: word.text,
    category: word.category,
    imageUri: word.imageUri || null,
    audioUri: word.audioUri || null,
    favorite: word.favorite || false,
  };

  const updatedWords = [...words, newWord];
  await saveWords(updatedWords);
};

/* =========================
   تحديث كلمة
   ========================= */
export const updateWord = async (updatedWord) => {
  const words = await getWords();

  const updatedWords = words.map((w) =>
    w.id === updatedWord.id
      ? {
          ...w,
          text: updatedWord.text,
          category: updatedWord.category,
          imageUri: updatedWord.imageUri || null,
          audioUri: updatedWord.audioUri || null,
          favorite: updatedWord.favorite || false,
        }
      : w
  );

  await saveWords(updatedWords);
};

/* =========================
   حذف كلمة
   ========================= */
export const deleteWord = async (id) => {
  const words = await getWords();

  const updatedWords = words.filter(
    (w) => w.id.toString() !== id.toString()
  );

  await saveWords(updatedWords);
};

/* =========================
   إعادة تعيين الكلمات للافتراضية
   ========================= */
export const resetToDefault = async () => {
  await saveWords(defaultWords);
};