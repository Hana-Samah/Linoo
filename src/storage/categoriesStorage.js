import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultCategories } from "../data/defaultWords";

const CATEGORIES_KEY = "AAC_CATEGORIES";
const INITIALIZED_KEY = "AAC_CATEGORIES_INITIALIZED";

/* =========================
   جلب التصنيفات
   ========================= */
export const getCategories = async () => {
  try {
    // ✅ التحقق إذا تم التهيئة من قبل
    const initialized = await AsyncStorage.getItem(INITIALIZED_KEY);
    
    if (!initialized) {
      // ✅ أول مرة - نحفظ التصنيفات الافتراضية
      await saveCategories(defaultCategories);
      await AsyncStorage.setItem(INITIALIZED_KEY, "true");
      return defaultCategories;
    }

    const data = await AsyncStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log("خطأ في قراءة التصنيفات", e);
    return [];
  }
};

/* =========================
   حفظ كل التصنيفات
   ========================= */
export const saveCategories = async (categories) => {
  try {
    await AsyncStorage.setItem(
      CATEGORIES_KEY,
      JSON.stringify(categories)
    );
  } catch (e) {
    console.log("خطأ في حفظ التصنيفات", e);
  }
};

/* =========================
   إضافة تصنيف
   ========================= */
export const addCategory = async (category) => {
  const categories = await getCategories();

  const newCategory = {
    id: category.id || Date.now().toString(),
    name: category.name,
    icon: category.icon || "📁",
  };

  await saveCategories([...categories, newCategory]);
};

/* =========================
   تحديث تصنيف
   ========================= */
export const updateCategory = async (updatedCategory) => {
  const categories = await getCategories();

  const updated = categories.map((c) =>
    c.id.toString() === updatedCategory.id.toString()
      ? { ...c, ...updatedCategory }
      : c
  );

  await saveCategories(updated);
};

/* =========================
   حذف تصنيف
   ========================= */
export const deleteCategory = async (id) => {
  const categories = await getCategories();

  const updated = categories.filter(
    (c) => c.id.toString() !== id.toString()
  );

  await saveCategories(updated);
};

/* =========================
   إعادة تعيين التصنيفات للافتراضية
   ========================= */
export const resetToDefault = async () => {
  await saveCategories(defaultCategories);
};