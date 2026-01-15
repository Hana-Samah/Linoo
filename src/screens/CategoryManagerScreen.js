import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getCategories,
  saveCategories,
} from "../storage/categoriesStorage";

export default function CategoryManagerScreen({ navigation }) {
  const [categories, setCategories] = useState([]);

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
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التصنيفات</Text>
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>🗂️</Text>
        </View>
      </View>

      {/* قائمة التصنيفات */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryCard}
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
              <Text style={styles.deleteIcon}>🗑️</Text>
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
        <Text style={styles.addIcon}>＋</Text>
        <Text style={styles.addText}>إضافة تصنيف جديد</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F5",
  },

  /* ====== الهيدر ====== */
  header: {
    backgroundColor: "#B5C9B4",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 28,
  },

  /* ====== القائمة ====== */
  listContent: {
    padding: 15,
    paddingBottom: 100,
  },

  /* ====== بطاقة التصنيف ====== */
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#F0F0F0",
  },

  /* ====== الأيقونة ====== */
  iconContainer: {
    marginRight: 15,
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "700",
    color: "#4A6B6F",
  },

  /* ====== زر الحذف ====== */
  deleteButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE8E8",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  deleteIcon: {
    fontSize: 26,
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
    fontWeight: "700",
    color: "#7A7A7A",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#9A9A9A",
  },

  /* ====== زر الإضافة ====== */
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#B5C9B4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: "#B5C9B4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  addIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    marginRight: 10,
  },
  addText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});