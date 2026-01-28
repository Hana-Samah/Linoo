import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
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
  home: require("../../assets/home-icon.webp"),
  speaker: require("../../assets/speaker-icon.webp"),
  backspace: require("../../assets/backspace-icon.webp"),
  clear: require("../../assets/clear-icon.webp"),
  star: require("../../assets/lion/lion_8.webp"),
  favorite: require("../../assets/manager/favorite-icon.webp"),
};

let currentSound = null;

export default function AACScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isPortrait = height > width;

  const [sentence, setSentence] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("fav");
  const [words, setWords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pressedWord, setPressedWord] = useState(null);
  const [showStars, setShowStars] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);

  const starsAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
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
          {
            id: "fav",
            name: "المفضلة",
            icon: (
              <Image
                source={icons.favorite}
                style={[
                  { width: isPortrait ? 45 : 40, height: isPortrait ? 45 : 40 },
                ]}
              />
            ),
          },
          ...storedCategories,
        ]);
      };

      loadData();
      updateDailyStreak();
    }, []),
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
        { shouldPlay: true },
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
            { shouldPlay: true },
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
      "تكوين جملة كاملة",
    );
    if (progressResult && progressResult.hairGrown) {
      console.log(`🦁 ${progressResult.message}`);
    }
  };

  const filteredWords = words.filter((w) => w.category === selectedCategory);

  // حساب عدد الأعمدة وعرض المربع
  const getGridLayout = () => {
    if (isPortrait) {
      // في العمودي: 3 أعمدة
      const columns = 3;
      const gap = 8;
      const horizontalPadding = 30; // 15 * 2
      const availableWidth = width - horizontalPadding - gap * (columns - 1);
      const cardWidth = availableWidth / columns;
      return { columns, cardWidth, gap };
    } else {
      // في الأفقي: 6 أعمدة
      const columns = 6;
      const gap = 10;
      const horizontalPadding = 30; // 15 * 2
      const availableWidth = width - horizontalPadding - gap * (columns - 1);
      const cardWidth = availableWidth / columns;
      return { columns, cardWidth, gap };
    }
  };

  const { columns, cardWidth, gap } = getGridLayout();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

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
        <View
          style={[
            styles.topBar,
            {
              paddingTop: isPortrait ? 10 : 8,
              paddingHorizontal: isPortrait ? 15 : 20,
              paddingBottom: isPortrait ? 10 : 8,
            },
          ]}
        >
          {/* زر الرجوع */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={[
              styles.homeButton,
              { width: isPortrait ? 50 : 45, height: isPortrait ? 50 : 45 },
            ]}
          >
            <Image
              source={icons.home}
              style={[
                styles.homeIcon,
                { width: isPortrait ? 28 : 26, height: isPortrait ? 28 : 26 },
              ]}
            />
          </TouchableOpacity>

          {/* شريط الجملة */}
          <View
            style={[
              styles.sentenceWrapper,
              { flex: 1, marginHorizontal: isPortrait ? 10 : 12 },
            ]}
          >
            <View
              style={[
                styles.sentenceContainer,
                {
                  height: isPortrait ? 140 : 100,
                  borderRadius: isPortrait ? 30 : 25,
                  paddingHorizontal: isPortrait ? 12 : 10,
                },
              ]}
            >
              <ScrollView
                horizontal
                contentContainerStyle={styles.sentenceScroll}
                showsHorizontalScrollIndicator={false}
              >
                {sentence.length === 0 ? (
                  <View style={styles.emptyMessage}>
                    <Text
                      style={[
                        styles.emptyText,
                        { fontSize: isPortrait ? 14 : 12 },
                      ]}
                    >
                      اختر كلمات لتكوين جملة
                    </Text>
                  </View>
                ) : (
                  sentence.map((w, i) => (
                    <View
                      key={i}
                      style={[
                        styles.sentenceWord,
                        {
                          width: isPortrait ? 90 : 75,
                          height: isPortrait ? 85 : 70,
                          marginHorizontal: isPortrait ? 4 : 3,
                          borderRadius: isPortrait ? 16 : 14,
                        },
                      ]}
                    >
                      <View style={styles.sentenceImageContainer}>
                        {w.imageUri ? (
                          <Image
                            source={{ uri: w.imageUri }}
                            style={styles.sentenceImage}
                          />
                        ) : (
                          <View style={styles.sentencePlaceholder}>
                            <Text
                              style={[
                                styles.placeholderText,
                                { fontSize: isPortrait ? 11 : 10 },
                              ]}
                            >
                              صورة
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.sentenceText,
                          { fontSize: isPortrait ? 10 : 9 },
                        ]}
                        numberOfLines={2}
                      >
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
                {
                  width: isPortrait ? 60 : 55,
                  height: isPortrait ? 60 : 55,
                  borderRadius: isPortrait ? 30 : 27.5,
                  marginTop: isPortrait ? 12 : 8,
                },
                sentence.length === 0 && styles.buttonDisabled,
              ]}
            >
              <Image
                source={icons.speaker}
                style={[
                  styles.speakIcon,
                  { width: isPortrait ? 30 : 28, height: isPortrait ? 30 : 28 },
                ]}
              />
            </TouchableOpacity>
          </View>

          {/* زر المسح */}
          <TouchableOpacity
            onPress={() => setSentence([])}
            disabled={sentence.length === 0}
            style={[
              styles.clearButton,
              {
                width: isPortrait ? 50 : 45,
                height: isPortrait ? 50 : 45,
                borderRadius: isPortrait ? 25 : 22.5,
              },
              sentence.length === 0 && styles.buttonDisabled,
            ]}
          >
            <Image
              source={icons.clear}
              style={[
                styles.clearIcon,
                { width: isPortrait ? 24 : 22, height: isPortrait ? 24 : 22 },
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* المحتوى الرئيسي */}
        <View
          style={[
            styles.mainContent,
            {
              flexDirection: isPortrait ? "column" : "row",
              paddingHorizontal: isPortrait ? 15 : 20,
              paddingTop: isPortrait ? 12 : 10,
              paddingBottom: isPortrait ? 15 : 10,
            },
          ]}
        >
          {/* لوحة الفئات */}
          <View
            style={[
              styles.categoriesPanel,
              isPortrait
                ? {
                    width: "100%",
                    height: 100,
                    marginBottom: 10,
                  }
                : {
                    width: 100,
                    marginRight: 15,
                  },
            ]}
          >
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
                    isPortrait
                      ? {
                          minWidth: 85,
                          minHeight: 85,
                          marginHorizontal: 5,
                          marginVertical: 0,
                          paddingVertical: 8,
                          paddingHorizontal: 8,
                          borderRadius: 18,
                        }
                      : {
                          minHeight: 80,
                          marginVertical: 5,
                          paddingVertical: 10,
                          paddingHorizontal: 8,
                          borderRadius: 18,
                        },
                    selectedCategory === cat.id && styles.categoryActive,
                  ]}
                >
                  <View style={styles.categoryIconContainer}>
                    {cat.imageUri ? (
                      <Image
                        source={{ uri: cat.imageUri }}
                        style={[
                          styles.categoryImage,
                          {
                            width: isPortrait ? 45 : 40,
                            height: isPortrait ? 45 : 40,
                          },
                        ]}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.categoryEmoji,
                          { fontSize: isPortrait ? 32 : 28 },
                        ]}
                      >
                        {cat.icon || "📁"}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        fontSize: isPortrait ? 10 : 9,
                      },
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

          {/* منطقة الكلمات - شبكة في الوسط */}
          <View style={styles.wordsArea}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={[
                  styles.wordsGrid,
                  {
                    gap: gap,
                    justifyContent: "center",
                  },
                ]}
              >
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
                        {
                          width: cardWidth,
                          height: isPortrait
                            ? cardWidth * 1.15
                            : cardWidth * 1.2,
                          marginBottom: gap,
                          borderRadius: isPortrait ? 16 : 14,
                        },
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
                            <Text
                              style={[
                                styles.placeholderText,
                                { fontSize: isPortrait ? 12 : 11 },
                              ]}
                            >
                              صورة
                            </Text>
                          </View>
                        )}
                      </View>
                      <View
                        style={[
                          styles.wordLabel,
                          {
                            paddingVertical: isPortrait ? 6 : 5,
                            paddingHorizontal: isPortrait ? 4 : 3,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.wordText,
                            { fontSize: isPortrait ? 11 : 10 },
                          ]}
                          numberOfLines={2}
                        >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
    gap: 10,
  },

  // زر الرجوع
  homeButton: {
    borderRadius: 25,
    backgroundColor: COLORS.primary.teal,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  homeIcon: {
    tintColor: COLORS.neutral.white,
  },

  // شريط الجملة
  sentenceWrapper: {
    alignItems: "center",
  },
  sentenceContainer: {
    width: "100%",
    backgroundColor: COLORS.primary.sage,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginTop: -20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
  },
  sentenceScroll: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 90,
  },
  emptyMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyText: {
    color: COLORS.neutral.white,
    fontWeight: "700",
  },
  sentenceWord: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.primary.green,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 3,
    minHeight: 25,
    backgroundColor: COLORS.neutral.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary.green,
  },

  // زر النطق
  speakButton: {
    backgroundColor: COLORS.secondary.orange,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  speakIcon: {
    // sizes set dynamically
  },

  // زر المسح
  clearButton: {
    borderWidth: 3,
    borderColor: COLORS.neutral.white,
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
    // sizes set dynamically
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  // المحتوى الرئيسي
  mainContent: {
    flex: 1,
    gap: 0,
  },

  // لوحة الفئات
  categoriesPanel: {
    backgroundColor: "transparent",
  },
  categoriesList: {
    paddingVertical: 5,
  },
  categoryButton: {
    backgroundColor: COLORS.neutral.white,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.neutral.cream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
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
    marginBottom: 4,
  },
  categoryImage: {
    // sizes set dynamically
  },
  categoryEmoji: {
    // sizes set dynamically
  },
  categoryText: {
    fontWeight: "600",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  categoryTextActive: {
    fontSize: 11,
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
    backgroundColor: COLORS.neutral.white,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.neutral.cream,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
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
    color: COLORS.text.light,
    fontWeight: "600",
  },
  wordLabel: {
    backgroundColor: COLORS.neutral.white,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 30,
    borderTopWidth: 2,
    borderTopColor: COLORS.neutral.cream,
  },
  wordText: {
    fontWeight: "700",
    color: COLORS.text.primary,
    textAlign: "center",
  },
});
