import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getCategories,
  saveCategories,
} from "../storage/categoriesStorage";
import { COLORS } from "../styles/colors";

const icons = {
  back: require("../../assets/backspace-icon.webp"),
  categories: require("../../assets/categories-icon.webp"),
  add: require("../../assets/manager/add-icon.webp"),
  delete: require("../../assets/clear-icon.webp"),
};

export default function CategoryManagerScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );
  const isPortrait = screenDimensions.height > screenDimensions.width;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const deleteCategory = (id) => {
    Alert.alert(
      "حذف تصنيف",
      "هل أنت متأكد من حذف هذا التصنيف؟\nملاحظة: الكلمات التابعة له لن تُحذف",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            const updated = categories.filter(
              (c) => c.id.toString() !== id.toString()
            );
            await saveCategories(updated);
            setCategories(updated);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 🎨 خلفية ترابية */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.floatingShape, styles.shape1]} />
        <View style={[styles.floatingShape, styles.shape2]} />
        <View style={[styles.floatingShape, styles.shape3]} />
        <View style={[styles.floatingShape, styles.shape4]} />
      </View>

      {/* الهيدر */}
      <View style={[styles.header, isPortrait && styles.headerPortrait]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={icons.back} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Image source={icons.categories} style={styles.headerIcon} resizeMode="contain" />
          <Text style={[styles.headerTitle, isPortrait && styles.headerTitlePortrait]}>التصنيفات</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {/* قائمة التصنيفات */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, isPortrait && styles.listContentPortrait]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryCard, isPortrait && styles.categoryCardPortrait]}
            onPress={() =>
              navigation.navigate("CategoryForm", {
                category: item,
              })
            }
            activeOpacity={0.85}
          >
            {/* الأيقونة/الصورة */}
            <View style={styles.iconContainer}>
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.iconCircle}>
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                </View>
              )}
            </View>

            {/* الاسم */}
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {item.name}
              </Text>
            </View>

            {/* زر الحذف */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteCategory(item.id)}
            >
              <Image source={icons.delete} style={styles.deleteIcon} resizeMode="contain" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyText}>لا توجد تصنيفات</Text>
            <Text style={styles.emptySubtext}>اضغط + لإضافة تصنيف جديد</Text>
          </View>
        }
      />

      {/* زر الإضافة */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CategoryForm")}
      >
        <Image source={icons.add} style={styles.addIcon} resizeMode="contain" />
        <Text style={styles.addText}>إضافة تصنيف جديد</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* 🎨 خلفية ترابية */
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floatingShape: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.08,
  },
  shape1: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.primary.green,
    top: -50,
    right: -60,
  },
  shape2: {
    width: 150,
    height: 150,
    backgroundColor: COLORS.secondary.orange,
    bottom: -40,
    left: -50,
  },
  shape3: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.primary.teal,
    top: "30%",
    left: -30,
  },
  shape4: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.secondary.peach,
    bottom: "25%",
    right: -20,
  },

  /* ====== الهيدر ====== */
  header: {
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 100,
  },
  headerPortrait: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 15,
  },
  backButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  backIcon: {
    width: 55,
    height: 55,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    tintColor: COLORS.primary.teal,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary.teal,
  },
  headerTitlePortrait: {
    fontSize: 24,
  },
  spacer: {
    width: 60,
  },

  /* ====== القائمة ====== */
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  listContentPortrait: {
    padding: 15,
  },

  /* ====== بطاقة التصنيف ====== */
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 25,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 4,
    borderColor: COLORS.primary.sage,
  },
  categoryCardPortrait: {
    borderRadius: 20,
    borderWidth: 3,
  },

  /* ====== الأيقونة ====== */
  iconContainer: {
    marginRight: 15,
  },
  categoryImage: {
    width: 75,
    height: 75,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  iconCircle: {
    width: 75,
    height: 75,
    borderRadius: 20,
    backgroundColor: COLORS.primary.sage,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 40,
  },

  /* ====== المعلومات ====== */
  categoryInfo: {
    flex: 1,
  },
  categoryText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text.primary,
  },

  /* ====== زر الحذف ====== */
  deleteButton: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  deleteIcon: {
    width: 28,
    height: 28,
  },

  /* ====== حالة فارغة ====== */
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyIcon: {
    fontSize: 80,
    opacity: 0.3,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.light,
  },

  /* ====== زر الإضافة ====== */
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary.teal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: COLORS.primary.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
    gap: 10,
  },
  addIcon: {
    width: 48,
    height: 28,
  },
  addText: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.neutral.white,
  },
});