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
import { getWords, saveWords } from "../storage/wordsStorage";

export default function WordManagerScreen({ navigation }) {
  const [words, setWords] = useState([]);

  const loadWords = async () => {
    const data = await getWords();
    setWords(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadWords();
    }, [])
  );

  const deleteWord = (id) => {
    Alert.alert("حذف كلمة", "هل أنت متأكد من حذف هذه الكلمة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          const updated = words.filter(
            (w) => w.id.toString() !== id.toString()
          );
          await saveWords(updated);
          setWords(updated);
        },
      },
    ]);
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
        <Text style={styles.headerTitle}>إدارة الكلمات</Text>
        <View style={styles.headerIconContainer}>
          <Text style={styles.headerIcon}>💬</Text>
        </View>
      </View>

      {/* قائمة الكلمات */}
      <FlatList
        data={words}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.wordCard}
            onPress={() => navigation.navigate("WordForm", { word: item })}
            activeOpacity={0.85}
          >
            {/* الصورة */}
            <View style={styles.imageContainer}>
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.wordImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderIcon}>💬</Text>
                </View>
              )}
            </View>

            {/* المعلومات */}
            <View style={styles.wordInfo}>
              <Text style={styles.wordText} numberOfLines={1}>
                {item.text}
              </Text>

              {/* الشارات */}
              <View style={styles.badges}>
                {item.favorite && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>⭐ مفضلة</Text>
                  </View>
                )}
                {item.useTTS ? (
                  <View style={[styles.badge, styles.ttsBadge]}>
                    <Text style={styles.badgeText}>🤖 TTS</Text>
                  </View>
                ) : item.audioUri ? (
                  <View style={[styles.badge, styles.recordBadge]}>
                    <Text style={styles.badgeText}>🎙️ مسجل</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* زر الحذف */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteWord(item.id)}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>لا توجد كلمات محفوظة</Text>
            <Text style={styles.emptySubtext}>اضغط + لإضافة كلمة جديدة</Text>
          </View>
        }
      />

      {/* زر الإضافة */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("WordForm")}
      >
        <Text style={styles.addIcon}>＋</Text>
        <Text style={styles.addText}>إضافة كلمة جديدة</Text>
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
    backgroundColor: "#7FA896",
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

  /* ====== بطاقة الكلمة ====== */
  wordCard: {
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

  /* ====== الصورة ====== */
  imageContainer: {
    marginRight: 15,
  },
  wordImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
  },
  placeholderImage: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 40,
  },

  /* ====== المعلومات ====== */
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A6B6F",
    marginBottom: 8,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: "#E8C68E",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ttsBadge: {
    backgroundColor: "#A8C5C5",
  },
  recordBadge: {
    backgroundColor: "#D9956C",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A4A4A",
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
    backgroundColor: "#7FA896",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: "#7FA896",
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