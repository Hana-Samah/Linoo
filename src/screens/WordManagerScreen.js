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
import { getWords, saveWords } from "../storage/wordsStorage";
import { COLORS } from "../styles/colors";

const icons = {
  back: require("../../assets/backspace-icon.webp"),
  words: require("../../assets/words-icon.webp"),
  add: require("../../assets/manager/add-icon.webp"),
  delete: require("../../assets/clear-icon.webp"),
  favorite: require("../../assets/manager/favorite-icon.webp"),
  tts: require("../../assets/manager/tts-icon.webp"),
  record: require("../../assets/manager/record-icon.webp"),
};

export default function WordManagerScreen({ navigation }) {
  const [words, setWords] = useState([]);
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
          <Image source={icons.words} style={styles.headerIcon} resizeMode="contain" />
          <Text style={[styles.headerTitle, isPortrait && styles.headerTitlePortrait]}>إدارة الكلمات</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      {/* قائمة الكلمات */}
      <FlatList
        data={words}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.listContent, isPortrait && styles.listContentPortrait]}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.wordCard, isPortrait && styles.wordCardPortrait]}
            onPress={() => navigation.navigate("WordForm", { word: item })}
            activeOpacity={0.85}
          >
            {/* الصورة */}
            <View style={styles.imageContainer}>
              {item.imageUri ? (
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.wordImage}
                  resizeMode="cover"
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
                    <Image source={icons.favorite} style={styles.badgeIcon} resizeMode="contain" />
                    <Text style={styles.badgeText}>مفضلة</Text>
                  </View>
                )}
                {item.useTTS ? (
                  <View style={[styles.badge, styles.ttsBadge]}>
                    <Image source={icons.tts} style={styles.badgeIcon} resizeMode="contain" />
                    <Text style={styles.badgeText}>TTS</Text>
                  </View>
                ) : item.audioUri ? (
                  <View style={[styles.badge, styles.recordBadge]}>
                    <Image source={icons.record} style={styles.badgeIcon} resizeMode="contain" />
                    <Text style={styles.badgeText}>مسجل</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* زر الحذف */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteWord(item.id)}
            >
              <Image source={icons.delete} style={styles.deleteIcon} resizeMode="contain" />
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
        <Image source={icons.add} style={styles.addIcon} resizeMode="contain" />
        <Text style={styles.addText}>إضافة كلمة جديدة</Text>
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
    width: 57,
    height: 57,
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
    tintColor: COLORS.primary.green,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary.green,
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

  /* ====== بطاقة الكلمة ====== */
  wordCard: {
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
  wordCardPortrait: {
    borderRadius: 20,
    borderWidth: 3,
  },

  /* ====== الصورة ====== */
  imageContainer: {
    marginRight: 15,
  },
  wordImage: {
    width: 75,
    height: 75,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  placeholderImage: {
    width: 75,
    height: 75,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.cream,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
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
    fontWeight: "900",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.secondary.yellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 2,
    borderColor: COLORS.neutral.white,
  },
  ttsBadge: {
    backgroundColor: COLORS.primary.teal,
  },
  recordBadge: {
    backgroundColor: COLORS.secondary.orange,
  },
  badgeIcon: {
    width: 26,
    height: 26,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.neutral.white,
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
    backgroundColor: COLORS.primary.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: COLORS.primary.green,
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