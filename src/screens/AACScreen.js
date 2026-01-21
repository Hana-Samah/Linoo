import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { getWords } from "../storage/wordsStorage";
import { getCategories } from "../storage/categoriesStorage";
import { trackWordUsage } from "../storage/wordsTracking";
import {
  addStars,
  updateDailyStreak,
  checkAchievements,
} from "../storage/rewardsTracking";
import {
  addDailyProgress,
  PROGRESS_REASONS,
} from "../storage/dailyLionProgress";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../styles/colors";

const icons = {
  home: require("../../assets/home-icon.png"),
  speaker: require("../../assets/speaker-icon.png"),
  backspace: require("../../assets/backspace-icon.png"),
  clear: require("../../assets/clear-icon.png"),
  star: require("../../assets/lion/lion_8.png"),
};

let currentSound = null;

export default function AACScreen({ navigation }) {
  const [sentence, setSentence] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("fav");
  const [words, setWords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pressedWord, setPressedWord] = useState(null);
  const [showStars, setShowStars] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [screenDimensions, setScreenDimensions] = useState(
    Dimensions.get("window")
  );

  const starsAnim = useRef(new Animated.Value(0)).current;

  // تحديد الوضع (عمودي أو أفقي)
  const isPortrait = screenDimensions.height > screenDimensions.width;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // فتح جميع الاتجاهات
      ScreenOrientation.unlockAsync();

      const loadData = async () => {
        const storedWords = await getWords();
        const storedCategories = await getCategories();

        const favorites = storedWords.filter((w) => w.favorite);
        const others = storedWords.filter((w) => !w.favorite);

        setWords([
          ...favorites.map((w) => ({ ...w, category: "fav" })),
          ...others,
        ]);

        setCategories([
          { id: "fav", name: "المفضلة", icon: "⭐" },
          ...storedCategories,
        ]);
      };

      loadData();
      updateDailyStreak();
    }, [])
  );

  const showStarsAnimation = (stars) => {
    setStarsEarned(stars);
    setShowStars(true);
    starsAnim.setValue(0);

    Animated.sequence([
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(starsAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowStars(false);
    });
  };

  const playWordAudio = async (word) => {
    setSentence((prev) => [...prev, word]);

    try {
      await trackWordUsage(word.id, word.text);
      const result = await addStars(1, `استخدام كلمة: ${word.text}`);

      const progressResult = await addDailyProgress("AAC_WORD", "استخدام كلمة");
      if (progressResult) {
        if (progressResult.hairGrown) {
          console.log(`🦁 ${progressResult.message}`);
        } else if (progressResult.actionsNeeded) {
          console.log(`⏳ ${progressResult.message}`);
        }
      }

      const allWords = await getWords();
      const uniqueWordsUsed = new Set(allWords.map((w) => w.id)).size;
      await checkAchievements("word", uniqueWordsUsed);

      if (result) {
        showStarsAnimation(result.starsAdded);
      }
    } catch (error) {
      console.log("خطأ في تسجيل النجوم:", error);
    }

    setPressedWord(word.id);
    setTimeout(() => setPressedWord(null), 300);

    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    Speech.stop();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    if (word.useTTS) {
      Speech.speak(word.text, { language: "ar", rate: 0.55, pitch: 1.2 });
    } else if (word.audioUri) {
      const { sound } = await Audio.Sound.createAsync(
        typeof word.audioUri === "string"
          ? { uri: word.audioUri }
          : word.audioUri,
        { shouldPlay: true }
      );

      currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
          currentSound = null;
        }
      });
    } else {
      Speech.speak(word.text, { language: "ar", rate: 1.0, pitch: 1.2 });
    }
  };

  const speakSentence = async () => {
    if (!sentence.length) return;

    Speech.stop();
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    for (let i = 0; i < sentence.length; i++) {
      const word = sentence[i];

      await new Promise((resolve) => {
        if (word.useTTS) {
          Speech.speak(word.text, {
            language: "ar",
            rate: 1.0,
            pitch: 1.2,
            onDone: resolve,
          });
        } else if (word.audioUri) {
          Audio.Sound.createAsync(
            typeof word.audioUri === "string"
              ? { uri: word.audioUri }
              : word.audioUri,
            { shouldPlay: true }
          ).then(({ sound }) => {
            currentSound = sound;

            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.didJustFinish) {
                sound.unloadAsync();
                currentSound = null;
                resolve();
              }
            });
          });
        } else {
          Speech.speak(word.text, {
            language: "ar",
            rate: 1.0,
            pitch: 1.2,
            onDone: resolve,
          });
        }
      });

      if (i < sentence.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    const progressResult = await addDailyProgress(
      "AAC_SENTENCE",
      "تكوين جملة كاملة"
    );
    if (progressResult && progressResult.hairGrown) {
      console.log(`🦁 ${progressResult.message}`);
    }
  };

  const filteredWords = words.filter((w) => w.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* 🎨 خلفية ترابية متحركة */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.floatingShape, styles.shape1]} />
        <View style={[styles.floatingShape, styles.shape2]} />
        <View style={[styles.floatingShape, styles.shape3]} />
        <View style={[styles.floatingShape, styles.shape4]} />
      </View>

      {/* نافذة النجوم المنبثقة */}
      {showStars && (
        <Animated.View
          style={[
            styles.starsPopup,
            {
              opacity: starsAnim,
              transform: [
                {
                  translateY: starsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
                {
                  scale: starsAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.2, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.starsText}>+{starsEarned} </Text>
          <Image source={icons.star} style={styles.starIcon} />
        </Animated.View>
      )}

      {/* الصف العلوي */}
      <View style={[styles.topBar, isPortrait && styles.topBarPortrait]}>
        {/* زر الرجوع */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.homeButton}
        >
          <Image source={icons.home} style={styles.homeIcon} />
        </TouchableOpacity>

        {/* شريط الجملة */}
        <View style={[styles.sentenceWrapper, isPortrait && styles.sentenceWrapperPortrait]}>
          <View style={[styles.sentenceContainer, isPortrait && styles.sentenceContainerPortrait]}>
            <ScrollView
              horizontal
              contentContainerStyle={styles.sentenceScroll}
              showsHorizontalScrollIndicator={false}
            >
              {sentence.length === 0 ? (
                <View style={styles.emptyMessage}>
                  <Text style={styles.emptyText}>اختر كلمات لتكوين جملة</Text>
                </View>
              ) : (
                sentence.map((w, i) => (
                  <View key={i} style={[styles.sentenceWord, isPortrait && styles.sentenceWordPortrait]}>
                    <View style={styles.sentenceImageContainer}>
                      {w.imageUri ? (
                        <Image
                          source={{ uri: w.imageUri }}
                          style={styles.sentenceImage}
                        />
                      ) : (
                        <View style={styles.sentencePlaceholder}>
                          <Text style={styles.placeholderText}>صورة</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.sentenceText} numberOfLines={2}>
                      {w.text}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {/* زر النطق */}
          <TouchableOpacity
            onPress={speakSentence}
            disabled={sentence.length === 0}
            style={[
              styles.speakButton,
              sentence.length === 0 && styles.buttonDisabled,
            ]}
          >
            <Image source={icons.speaker} style={styles.speakIcon} />
          </TouchableOpacity>
        </View>

        {/* زر المسح */}
        <TouchableOpacity
          onPress={() => setSentence([])}
          disabled={sentence.length === 0}
          style={[
            styles.clearButton,
            sentence.length === 0 && styles.buttonDisabled,
          ]}
        >
          <Image source={icons.clear} style={styles.clearIcon} />
        </TouchableOpacity>
      </View>

      {/* المحتوى الرئيسي */}
      <View style={[styles.mainContent, isPortrait && styles.mainContentPortrait]}>
        {/* لوحة الفئات */}
        <View style={[styles.categoriesPanel, isPortrait && styles.categoriesPanelPortrait]}>
          <ScrollView 
            style={styles.categoriesList}
            horizontal={isPortrait}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryButton,
                  isPortrait && styles.categoryButtonPortrait,
                  selectedCategory === cat.id && styles.categoryActive,
                ]}
              >
                <View style={styles.categoryIconContainer}>
                  {cat.imageUri ? (
                    <Image
                      source={{ uri: cat.imageUri }}
                      style={styles.categoryImage}
                    />
                  ) : (
                    <Text style={styles.categoryEmoji}>{cat.icon || "📁"}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                  numberOfLines={2}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* منطقة الكلمات */}
        <View style={styles.wordsArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.wordsGrid}>
              {filteredWords.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    لا توجد كلمات في هذه الفئة
                  </Text>
                </View>
              ) : (
                filteredWords.map((word) => (
                  <TouchableOpacity
                    key={word.id}
                    onPress={() => playWordAudio(word)}
                    style={[
                      styles.wordCard,
                      isPortrait && styles.wordCardPortrait,
                      pressedWord === word.id && styles.wordCardPressed,
                    ]}
                  >
                    <View style={styles.wordImageContainer}>
                      {word.imageUri ? (
                        <Image
                          source={{ uri: word.imageUri }}
                          style={styles.wordImage}
                        />
                      ) : (
                        <View style={styles.wordPlaceholder}>
                          <Text style={styles.placeholderText}>صورة</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.wordLabel}>
                      <Text style={styles.wordText} numberOfLines={2}>
                        {word.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
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

  // نافذة النجوم
  starsPopup: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 4,
    borderColor: COLORS.secondary.yellow,
  },
  starsText: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.secondary.orange,
    marginRight: 10,
  },
  starIcon: {
    width: 40,
    height: 40,
  },

  // الصف العلوي
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    gap: 12,
  },
  topBarPortrait: {
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingHorizontal: 10,
  },

  // زر الرجوع
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary.teal,
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
  homeIcon: {
    width: 32,
    height: 32,
    tintColor: COLORS.neutral.white,
  },

  // شريط الجملة
  sentenceWrapper: {
    flex: 1,
    alignItems: "center",
  },
  sentenceWrapperPortrait: {
    flex: 1,
  },
  sentenceContainer: {
    width: "100%",
    height: 180,
    backgroundColor: COLORS.primary.sage,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 60,
    borderBottomLeftRadius: 60,
    alignItems: "center",
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginTop: -40,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  sentenceContainerPortrait: {
    height: 140,
    borderBottomRightRadius: 45,
    borderBottomLeftRadius: 45,
    marginTop: -30,
  },
  sentenceScroll: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: 130,
  },
  emptyMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.neutral.white,
    fontWeight: "700",
  },
  sentenceWord: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 5,
    width: 120,
    height: 115,
    borderWidth: 3,
    borderColor: COLORS.primary.green,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  sentenceWordPortrait: {
    width: 100,
    height: 100,
  },
  sentenceImageContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: COLORS.neutral.cream,
  },
  sentenceImage: {
    width: "100%",
    height: "100%",
  },
  sentencePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral.cream,
  },
  sentenceText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 35,
    backgroundColor: COLORS.neutral.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary.green,
  },

  // زر النطق
  speakButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.secondary.orange,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    marginTop: 15,
  },
  speakIcon: {
    width: 34,
    height: 34,
    tintColor: COLORS.neutral.white,
  },

  // زر المسح
  clearButton: {
    borderWidth: 5,
    borderColor: COLORS.neutral.white,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary.darkTeal,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  clearIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.neutral.white,
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  // المحتوى الرئيسي
  mainContent: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  mainContentPortrait: {
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingTop: 10,
  },

  // لوحة الفئات
  categoriesPanel: {
    width: 110,
    backgroundColor: "transparent",
    marginRight: 15,
  },
  categoriesPanelPortrait: {
    width: "100%",
    height: 120,
    marginRight: 0,
    marginBottom: 10,
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryButton: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 6,
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.neutral.cream,
    minHeight: 95,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  categoryButtonPortrait: {
    minWidth: 100,
    minHeight: 100,
    marginHorizontal: 6,
    marginVertical: 0,
    paddingVertical: 10,
  },
  categoryActive: {
    backgroundColor: COLORS.neutral.white,
    borderColor: COLORS.primary.green,
    shadowColor: COLORS.primary.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  categoryIconContainer: {
    marginBottom: 6,
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  categoryEmoji: {
    fontSize: 36,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  categoryTextActive: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary.green,
  },

  // منطقة الكلمات
  wordsArea: {
    flex: 1,
  },
  wordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingBottom: 20,
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.text.light,
    fontWeight: "600",
  },

  // بطاقات الكلمات
  wordCard: {
    width: 125,
    height: 140,
    margin: 7,
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.neutral.cream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  wordCardPortrait: {
    width: "45%",
    maxWidth: 160,
    height: 160,
    margin: 5,
  },
  wordCardPressed: {
    borderColor: COLORS.primary.green,
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.3,
  },
  wordImageContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral.cream,
  },
  wordImage: {
    width: "100%",
    height: "100%",
  },
  wordPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral.cream,
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.text.light,
    fontWeight: "600",
  },
  wordLabel: {
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    borderTopWidth: 2,
    borderTopColor: COLORS.neutral.cream,
  },
  wordText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
  },
});